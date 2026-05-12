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

$body  = json_decode(file_get_contents('php://input'), true);
$email = trim($body['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid email address is required.']);
    exit;
}

// Always return the same response regardless of outcome — prevents account enumeration.
$generic = ['success' => true, 'message' => 'If this email is registered, you will receive a reset link shortly.'];

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT user_id, first_name, status, reset_token_expires_at
         FROM Users WHERE email = :email LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Unknown email or non-active account — return generic response silently.
    if (!$user || $user['status'] !== 'active') {
        http_response_code(200);
        echo json_encode($generic);
        exit;
    }

    // Rate limit: block if a token was issued less than 10 minutes ago.
    // Token lifetime is 1 hour, so if expires_at is > 50 minutes in the future
    // the token was created less than 10 minutes ago.
    if (!empty($user['reset_token_expires_at'])) {
        $issuedAt = strtotime($user['reset_token_expires_at']) - 3600;
        if ((time() - $issuedAt) < 600) {
            http_response_code(200);
            echo json_encode($generic);
            exit;
        }
    }

    // Generate a cryptographically secure token and store it.
    $token   = bin2hex(random_bytes(32)); // 64 hex characters
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->prepare(
        "UPDATE Users
         SET reset_token = :token, reset_token_expires_at = :expires
         WHERE user_id = :id"
    )->execute([':token' => $token, ':expires' => $expires, ':id' => (int)$user['user_id']]);

    // Build reset URL from a hardcoded base — NEVER use $_SERVER['HTTP_HOST']
    // (vulnerable to Host header injection). Set APP_URL in config.php for production.
    defined('APP_URL') || define('APP_URL', 'http://localhost:5173');
    $resetUrl = APP_URL . '/reset-password?token=' . $token;

    Mailer::send(
        $email,
        $user['first_name'],
        'Reset your FinHub password',
        EmailTemplates::passwordReset($user['first_name'], $resetUrl)
    );

    http_response_code(200);
    echo json_encode($generic);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}