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
        "SELECT consultant_id, email, first_name
         FROM Consultants
         WHERE reset_token = :token AND reset_token_expires_at > NOW()
         LIMIT 1"
    );
    $stmt->execute([':token' => $token]);
    $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$consultant) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This reset link is invalid or has expired.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $db->prepare(
        "UPDATE Consultants
         SET password = :hash, reset_token = NULL, reset_token_expires_at = NULL,
             must_change_password = 0
         WHERE consultant_id = :id"
    )->execute([':hash' => $hash, ':id' => (int)$consultant['consultant_id']]);

    // Invalidate any active consultant session.
    unset($_SESSION['consultant']);

    Mailer::send(
        $consultant['email'],
        $consultant['first_name'],
        'Your FinHub Consultant password was changed',
        EmailTemplates::passwordResetConfirmation($consultant['first_name'], date('Y-m-d H:i:s'), 'UTC')
    );

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Password reset successfully. You can now sign in.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
