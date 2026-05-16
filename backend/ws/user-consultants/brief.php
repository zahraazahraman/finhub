<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/InquiryBLL.php';

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$data         = json_decode(file_get_contents('php://input'), true) ?? [];
$consultantId = (int)($data['consultant_id'] ?? 0);
$userNote     = trim($data['user_note'] ?? '');
$includeData  = isset($data['include_data']) ? (bool)$data['include_data'] : true;

if ($consultantId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'consultant_id is required.']);
    exit;
}

$bll = new InquiryBLL();
echo json_encode($bll->generateBrief($userId, $consultantId, $userNote, $includeData));
