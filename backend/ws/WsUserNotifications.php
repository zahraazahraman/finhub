<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/UserNotificationBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new UserNotificationBLL();
$parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '/', '/'));
$id     = (int)($parts[0] ?? 0);

// GET — get all user notifications
if ($method === 'GET') {
    $notifications = $bll->getAll();
    http_response_code(200);
    echo json_encode($notifications);
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
