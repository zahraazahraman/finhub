<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/MyNotificationBLL.php';

$user = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new MyNotificationBLL();
$parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '/', '/'));
$seg    = $parts[0] ?? '';   // e.g. "123" or "mark-all-read" or ""
$action = $_GET['action'] ?? '';

header('Content-Type: application/json');

// ── GET /api/my-notifications?action=unread_count ──
if ($method === 'GET' && $action === 'unread_count') {
    echo json_encode($bll->getUnreadCount($userId));
    exit;
}

// ── GET /api/my-notifications?action=recent ──
if ($method === 'GET' && $action === 'recent') {
    $notifications = $bll->getRecent($userId);
    echo json_encode(['success' => true, 'notifications' => $notifications]);
    exit;
}

// ── GET /api/my-notifications ──
if ($method === 'GET') {
    $notifications = $bll->getAll($userId);
    echo json_encode(['success' => true, 'notifications' => $notifications]);
    exit;
}

// ── PATCH /api/my-notifications/mark-all-read ──
if ($method === 'PATCH' && $seg === 'mark-all-read') {
    echo json_encode($bll->markAllRead($userId));
    exit;
}

// ── PATCH /api/my-notifications/{id} ──
if ($method === 'PATCH' && is_numeric($seg)) {
    $id = (int)$seg;
    echo json_encode($bll->markRead($userId, $id));
    exit;
}

// ── DELETE /api/my-notifications/{id} ──
if ($method === 'DELETE' && is_numeric($seg)) {
    $id = (int)$seg;
    echo json_encode($bll->delete($userId, $id));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);