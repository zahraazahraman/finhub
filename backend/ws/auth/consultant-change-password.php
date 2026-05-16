<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

AuthMiddleware::requireConsultant();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body        = json_decode(file_get_contents('php://input'), true);
$newPassword = trim($body['new_password'] ?? '');

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}

try {
    $consultant = AuthMiddleware::getConsultant();
    $db         = Database::getInstance();

    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $db->prepare(
        "UPDATE Consultants
         SET password = :password, must_change_password = 0
         WHERE consultant_id = :id"
    )->execute([':password' => $hashed, ':id' => $consultant['consultant_id']]);

    $_SESSION['consultant']['must_change_password'] = 0;

    http_response_code(200);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
