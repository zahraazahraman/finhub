<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/AdminNotificationBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new AdminNotificationBLL();
$parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$id     = (int)($parts[0] ?? 0);
$action = $parts[1] ?? '';

// GET — get all or unread count or recent
if ($method === 'GET') {
    $path = trim($_SERVER['PATH_INFO'] ?? '/', '/');
    
    if ($path === 'unread-count') {
        echo json_encode($bll->getUnreadCount());
    } elseif ($path === 'recent') {
        echo json_encode($bll->getRecent());
    } else {
        echo json_encode($bll->getAll());
    }
    http_response_code(200);
    exit;
}

// PATCH — mark one or all as read
if ($method === 'PATCH') {
    if ($parts[0] === 'mark-all-read') {
        $result = $bll->markAllRead();
    } else {
        $result = $bll->markRead($id);
    }
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

// DELETE — delete notification
if ($method === 'DELETE') {
    $result = $bll->delete($id);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);