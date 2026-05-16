<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/ConsultantInquiryBLL.php';

AuthMiddleware::requireConsultant();

$consultant   = AuthMiddleware::getConsultant();
$consultantId = (int)$consultant['consultant_id'];
$method       = $_SERVER['REQUEST_METHOD'];
$bll          = new ConsultantInquiryBLL();

// GET ?stats=1 → dashboard stats; GET → inbox
if ($method === 'GET') {
    if (!empty($_GET['stats'])) {
        echo json_encode($bll->getStats($consultantId));
    } else {
        echo json_encode($bll->getInbox($consultantId));
    }
    exit;
}

// PATCH /{id}/reply  or  /{id}/close
if ($method === 'PATCH') {
    $parts     = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $inquiryId = (int)($parts[0] ?? 0);
    $action    = $parts[1] ?? '';
    $data      = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($inquiryId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'inquiry_id is required.']);
        exit;
    }

    if ($action === 'reply') {
        $replyText = trim($data['reply_text'] ?? '');
        $result    = $bll->reply($consultantId, $inquiryId, $replyText);
    } elseif ($action === 'close') {
        $result = $bll->close($consultantId, $inquiryId);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unknown action.']);
        exit;
    }

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
