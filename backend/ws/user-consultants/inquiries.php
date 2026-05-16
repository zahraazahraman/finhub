<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/InquiryBLL.php';

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new InquiryBLL();

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'checkEligibility') {
        $consultantId = (int)($_GET['consultant_id'] ?? 0);
        if ($consultantId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'consultant_id is required.']);
            exit;
        }
        echo json_encode($bll->checkEligibility($userId, $consultantId));
        exit;
    }

    // Default: all inquiries for the current user
    echo json_encode($bll->getUserInquiries($userId));
    exit;
}

if ($method === 'POST') {
    $data         = json_decode(file_get_contents('php://input'), true) ?? [];
    $consultantId = (int)($data['consultant_id'] ?? 0);
    $brief        = trim($data['brief_text']    ?? '');
    $note         = trim($data['user_note']     ?? '');
    $situationTag = trim($data['situation_tag'] ?? '');

    if ($consultantId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'consultant_id is required.']);
        exit;
    }

    echo json_encode($bll->submitInquiry($userId, $consultantId, $brief, $note, $situationTag));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
