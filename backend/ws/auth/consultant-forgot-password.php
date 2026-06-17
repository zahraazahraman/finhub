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

// Always return the same response — prevents account enumeration.
$generic = ['success' => true, 'message' => 'If this email is registered, you will receive a reset link shortly.'];

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT consultant_id, first_name, reset_token_expires_at
         FROM Consultants WHERE email = :email LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$consultant) {
        http_response_code(200);
        echo json_encode($generic);
        exit;
    }

    // Rate limit: block if a token was issued less than 10 minutes ago.
    if (!empty($consultant['reset_token_expires_at'])) {
        $issuedAt = strtotime($consultant['reset_token_expires_at']) - 3600;
        if ((time() - $issuedAt) < 600) {
            http_response_code(200);
            echo json_encode($generic);
            exit;
        }
    }

    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->prepare(
        "UPDATE Consultants
         SET reset_token = :token, reset_token_expires_at = :expires
         WHERE consultant_id = :id"
    )->execute([':token' => $token, ':expires' => $expires, ':id' => (int)$consultant['consultant_id']]);

    $resetUrl = APP_URL . '/consultant/reset-password?token=' . $token;

    Mailer::send(
        $email,
        $consultant['first_name'],
        'Reset your FinHub Consultant password',
        EmailTemplates::passwordReset($consultant['first_name'], $resetUrl)
    );

    http_response_code(200);
    echo json_encode($generic);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
