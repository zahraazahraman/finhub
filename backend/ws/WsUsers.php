<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/UserBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new UserBLL();

// GET /api/users — get all users
if ($method === 'GET') {
    $users = $bll->getAll();
    http_response_code(200);
    echo json_encode($users);
    exit;
}

// PATCH /api/users/{id}/status — update status
if ($method === 'PATCH') {
    $parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $userId = (int)($parts[0] ?? 0);
    $body   = json_decode(file_get_contents('php://input'), true);
    $status = $body['status'] ?? '';

    $result = $bll->updateStatus($userId, $status);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

// DELETE /api/users/{id} — delete user
if ($method === 'DELETE') {
    $parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $userId = (int)($parts[0] ?? 0);

    $result = $bll->delete($userId);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);