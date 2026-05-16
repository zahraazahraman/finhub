<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/ReviewBLL.php';

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ReviewBLL();

if ($method === 'GET') {
    $consultantId = (int)($_GET['consultant_id'] ?? 0);
    if ($consultantId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'consultant_id is required.']);
        exit;
    }
    echo json_encode($bll->getByConsultant($consultantId));
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    echo json_encode($bll->submitReview($userId, $data));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
