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
$token    = trim($body['token']    ?? '');
$password = trim($body['password'] ?? '');
$confirm  = trim($body['confirm']  ?? '');

if (!$token) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Reset token is missing.']);
    exit;
}

if (!$password || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

if ($password !== $confirm) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT user_id, email, first_name, timezone
         FROM Users
         WHERE reset_token = :token AND reset_token_expires_at > NOW()
         LIMIT 1"
    );
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This reset link is invalid or has expired.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Update password and clear the reset token in one statement (makes it single-use).
    $db->prepare(
        "UPDATE Users
         SET password_hash = :hash, reset_token = NULL, reset_token_expires_at = NULL
         WHERE user_id = :id"
    )->execute([':hash' => $hash, ':id' => (int)$user['user_id']]);

    // Invalidate all persistent sessions — forces re-login on every device.
    // If someone else triggered the reset, this limits exposure immediately.
    $db->prepare("DELETE FROM UserSessions WHERE user_id = :id")
       ->execute([':id' => (int)$user['user_id']]);

    // Send a security confirmation so the user knows their password changed.
        $whenUtc = date('Y-m-d H:i:s'); // current UTC time (PHP timezone is set to UTC)
    Mailer::send(
        $user['email'],
        $user['first_name'],
        'Your FinHub password was changed',
            EmailTemplates::passwordResetConfirmation(
                $user['first_name'],
                $whenUtc,
                $user['timezone'] ?? 'UTC'
            )
    );

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Password reset successfully. You can now sign in.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}