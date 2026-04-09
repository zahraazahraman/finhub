<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/CategoryBLL.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET — accessible by both admin and users
if ($method === 'GET') {
    if (!AuthMiddleware::isAdmin() && !AuthMiddleware::isUser()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
        exit;
    }
    $bll        = new CategoryBLL();
    $categories = $bll->getAll();
    http_response_code(200);
    echo json_encode($categories);
    exit;
}

// POST and DELETE — admin only
AuthMiddleware::requireAdmin();

$bll = new CategoryBLL();

// POST — create category
if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $result = $bll->create($data);
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
    exit;
}

// DELETE — delete category
if ($method === 'DELETE') {
    $parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $id     = (int)($parts[0] ?? 0);
    $result = $bll->delete($id);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
