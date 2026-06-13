<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../services/Mailer.php';
require_once __DIR__ . '/../../services/EmailTemplates.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body   = json_decode(file_get_contents('php://input'), true);
$email  = trim($body['email']  ?? '');
$action = trim($body['action'] ?? 'verify'); // 'verify' | 'resend'

// Accept the device timezone so the auto-login session matches what user-login.php stores.
$timezone = trim($body['timezone'] ?? 'UTC');
if (!in_array($timezone, timezone_identifiers_list(), true)) {
    $timezone = 'UTC';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid email address is required.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT user_id, first_name, last_name, email, status,
                email_verified, verification_code, verification_code_expires_at,
                preferred_currency_id, ai_tone, ai_data_sharing, weekly_summary_enabled
         FROM Users WHERE email = :email LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Account not found.']);
        exit;
    }

    if ((int)$user['email_verified'] === 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This email is already verified.']);
        exit;
    }

    // ── RESEND ──────────────────────────────────────────────────────────────
    if ($action === 'resend') {
        // Rate limit: allow resend only if the current code was issued > 60s ago.
        if (!empty($user['verification_code_expires_at'])) {
            $expiresAt   = strtotime($user['verification_code_expires_at']);
            $secondsLeft = $expiresAt - time();
            if ($secondsLeft > (14 * 60)) {
                $waitSeconds = $secondsLeft - (14 * 60);
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'message' => "Please wait {$waitSeconds} seconds before requesting a new code.",
                ]);
                exit;
            }
        }

        $code    = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        $db->prepare(
            "UPDATE Users
             SET verification_code = :code, verification_code_expires_at = :expires
             WHERE user_id = :id"
        )->execute([':code' => $code, ':expires' => $expires, ':id' => (int)$user['user_id']]);

        Mailer::send(
            $user['email'],
            $user['first_name'],
            'Your new FinHub verification code',
            EmailTemplates::verificationCode($user['first_name'], $code)
        );

        echo json_encode(['success' => true, 'message' => 'A new code has been sent to your email.']);
        exit;
    }

    // ── VERIFY ──────────────────────────────────────────────────────────────
    $code = trim($body['code'] ?? '');

    if (empty($code)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Verification code is required.']);
        exit;
    }

    if (empty($user['verification_code_expires_at']) ||
        strtotime($user['verification_code_expires_at']) < time()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This code has expired. Please request a new one.']);
        exit;
    }

    if ($user['verification_code'] !== $code) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Incorrect code. Please try again.']);
        exit;
    }

    // ── Mark verified, clear code columns, store detected timezone ──
    $db->prepare(
        "UPDATE Users
         SET email_verified = 1,
             verification_code = NULL,
             verification_code_expires_at = NULL,
             timezone = :tz
         WHERE user_id = :id"
    )->execute([':tz' => $timezone, ':id' => (int)$user['user_id']]);

    // ── Auto-login: set session (same shape as user-login.php) ──
    $_SESSION['user'] = [
        'user_id'                => $user['user_id'],
        'first_name'             => $user['first_name'],
        'last_name'              => $user['last_name'],
        'email'                  => $user['email'],
        'preferred_currency_id'  => (int) ($user['preferred_currency_id'] ?? 1),
        'ai_tone'                => $user['ai_tone']               ?? 'professional',
        'ai_data_sharing'        => (int) ($user['ai_data_sharing']        ?? 0),
        'weekly_summary_enabled' => (int) ($user['weekly_summary_enabled'] ?? 1),
        'timezone'               => $timezone,
    ];

    // ── Persistent session token (30 days) — same as user-login.php ──
    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+30 days'));

    $db->prepare("DELETE FROM UserSessions WHERE user_id = :id")
       ->execute([':id' => (int) $user['user_id']]);

    $db->prepare(
        "INSERT INTO UserSessions (user_id, session_token, expires_at)
         VALUES (:user_id, :token, :expires)"
    )->execute([
        ':user_id' => (int) $user['user_id'],
        ':token'   => $token,
        ':expires' => $expires,
    ]);

    setcookie('finhub_token', $token, [
        'expires'  => time() + (30 * 24 * 60 * 60),
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Email verified successfully.',
        'user'    => $_SESSION['user'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}