<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/ChatBLL.php';

AuthMiddleware::verifyUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ChatBLL();

// GET — load or create active session + message history
if ($method === 'GET') {
    echo json_encode($bll->getOrCreateSession($userId));
    exit;
}

// POST — send a user message, get AI response
if ($method === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true) ?? [];
    $sessionId = (int)($data['session_id'] ?? 0);
    $message   = trim($data['message'] ?? '');

    if ($sessionId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'session_id is required.']);
        exit;
    }

    echo json_encode($bll->sendMessage($userId, $sessionId, $message));
    exit;
}

// DELETE — end current session and start a fresh one
if ($method === 'DELETE') {
    echo json_encode($bll->startNewSession($userId));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);