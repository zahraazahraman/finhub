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

$body     = json_decode(file_get_contents('php://input'), true);
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT user_id, first_name, last_name, email, password_hash, status,
                email_verified,
                preferred_currency_id, ai_tone, ai_data_sharing, weekly_summary_enabled
         FROM Users WHERE email = :email LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
        exit;
    }

    if ($user['status'] === 'suspended') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Your account has been suspended.']);
        exit;
    }

    if ($user['status'] === 'inactive') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Your account is inactive.']);
        exit;
    }

    // ── Email not verified — generate a fresh OTP and redirect to verification ──
    if (!(int)$user['email_verified']) {
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
            'Verify your FinHub account',
            EmailTemplates::verificationCode($user['first_name'], $code)
        );

        http_response_code(403);
        echo json_encode([
            'success'            => false,
            'needs_verification' => true,
            'email'              => $user['email'],
            'message'            => 'Please verify your email before signing in. We sent a new code to your inbox.',
        ]);
        exit;
    }

    // ── Verified — create PHP session ──
    $_SESSION['user'] = [
        'user_id'                => $user['user_id'],
        'first_name'             => $user['first_name'],
        'last_name'              => $user['last_name'],
        'email'                  => $user['email'],
        'preferred_currency_id'  => (int) ($user['preferred_currency_id'] ?? 1),
        'ai_tone'                => $user['ai_tone']               ?? 'professional',
        'ai_data_sharing'        => (int) ($user['ai_data_sharing']        ?? 1),
        'weekly_summary_enabled' => (int) ($user['weekly_summary_enabled'] ?? 1),
    ];

    // ── Persistent session token (30 days) ──
    // One active token per user at a time — replace any existing tokens.
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
        'httponly' => true,   // not accessible to JavaScript
        'samesite' => 'Lax',  // safe default; use 'Strict' if the app is never opened via external links
    ]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'user'    => $_SESSION['user'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}