<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../services/Mailer.php';
require_once __DIR__ . '/../../services/EmailTemplates.php';

AuthMiddleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body         = json_decode(file_get_contents('php://input'), true);
$consultantId = (int)($body['consultant_id'] ?? 0);

if ($consultantId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid consultant.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT consultant_id, first_name, email, reset_token_expires_at
         FROM Consultants WHERE consultant_id = :id LIMIT 1"
    );
    $stmt->execute([':id' => $consultantId]);
    $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$consultant) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Consultant not found.']);
        exit;
    }

    // Rate limit: one reset email per 10 minutes.
    if (!empty($consultant['reset_token_expires_at'])) {
        $issuedAt = strtotime($consultant['reset_token_expires_at']) - 3600;
        if ((time() - $issuedAt) < 600) {
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'A reset link was already sent recently. Please wait 10 minutes before resending.']);
            exit;
        }
    }

    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $db->prepare(
        "UPDATE Consultants
         SET reset_token = :token, reset_token_expires_at = :expires
         WHERE consultant_id = :id"
    )->execute([':token' => $token, ':expires' => $expires, ':id' => $consultantId]);

    $resetUrl = APP_URL . '/consultant/reset-password?token=' . $token;

    Mailer::send(
        $consultant['email'],
        $consultant['first_name'],
        'Reset your FinHub Consultant password',
        EmailTemplates::passwordReset($consultant['first_name'], $resetUrl)
    );

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Password reset link sent to ' . $consultant['email']]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
