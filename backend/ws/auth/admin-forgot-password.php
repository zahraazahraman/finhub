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

$generic = ['success' => true, 'message' => 'If this email is registered, you will receive a reset link shortly.'];

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT admin_id, reset_token_expires_at
         FROM Admins WHERE email = :email LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(200);
        echo json_encode($generic);
        exit;
    }

    // Rate limit: block if a token was issued less than 10 minutes ago.
    if (!empty($admin['reset_token_expires_at'])) {
        $issuedAt = strtotime($admin['reset_token_expires_at']) - 3600;
        if ((time() - $issuedAt) < 600) {
            http_response_code(200);
            echo json_encode($generic);
            exit;
        }
    }

    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->prepare(
        "UPDATE Admins
         SET reset_token = :token, reset_token_expires_at = :expires
         WHERE admin_id = :id"
    )->execute([':token' => $token, ':expires' => $expires, ':id' => (int)$admin['admin_id']]);

    defined('APP_URL') || define('APP_URL', 'http://localhost:5173');
    $resetUrl = APP_URL . '/admin/reset-password?token=' . $token;

    // Derive a display name from the email prefix since Admins has no first_name column.
    $displayName = ucfirst(strstr($email, '@', true));

    Mailer::send(
        $email,
        $displayName,
        'Reset your FinHub Admin password',
        EmailTemplates::passwordReset($displayName, $resetUrl)
    );

    http_response_code(200);
    echo json_encode($generic);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}