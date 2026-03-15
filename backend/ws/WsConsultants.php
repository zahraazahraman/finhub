<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/ConsultantBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ConsultantBLL();

// GET — get all consultants
if ($method === 'GET') {
    $consultants = $bll->getAll();
    http_response_code(200);
    echo json_encode($consultants);
    exit;
}

// POST — create consultant
if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $result = $bll->create($data);
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
    exit;
}

// PUT — update consultant
if ($method === 'PUT') {
    $parts = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $id    = (int)($parts[0] ?? 0);
    $data  = json_decode(file_get_contents('php://input'), true);
    $result = $bll->update($id, $data);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

// DELETE — delete consultant
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