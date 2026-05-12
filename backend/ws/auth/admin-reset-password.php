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
        "SELECT admin_id, email
         FROM Admins
         WHERE reset_token = :token AND reset_token_expires_at > NOW()
         LIMIT 1"
    );
    $stmt->execute([':token' => $token]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This reset link is invalid or has expired.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Update password and clear the reset token (single-use).
    $db->prepare(
        "UPDATE Admins
         SET password_hash = :hash, reset_token = NULL, reset_token_expires_at = NULL
         WHERE admin_id = :id"
    )->execute([':hash' => $hash, ':id' => (int)$admin['admin_id']]);

    // Invalidate any active admin PHP session.
    unset($_SESSION['admin']);

    // Send confirmation email.
    $displayName = ucfirst(strstr($admin['email'], '@', true));
    $whenUtc = date('Y-m-d H:i:s');
    Mailer::send(
        $admin['email'],
        $displayName,
        'Your FinHub Admin password was changed',
        EmailTemplates::passwordResetConfirmation($displayName, $whenUtc, 'UTC')
    );

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Password reset successfully. You can now sign in.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}