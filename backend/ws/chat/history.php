<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/ChatBLL.php';

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ChatBLL();

// GET — list past sessions, or fetch messages for a specific session
if ($method === 'GET') {
    $sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;

    if ($sessionId > 0) {
        echo json_encode($bll->getSessionMessages($userId, $sessionId));
    } else {
        echo json_encode($bll->getHistory($userId));
    }
    exit;
}

// POST — resume a past session as the active one
if ($method === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true) ?? [];
    $sessionId = (int)($data['session_id'] ?? 0);

    if ($sessionId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'session_id is required.']);
        exit;
    }

    echo json_encode($bll->resumeSession($userId, $sessionId));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
