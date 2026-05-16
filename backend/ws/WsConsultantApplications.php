<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/ConsultantApplicationBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ConsultantApplicationBLL();

// GET ?id=N → single application; GET (no params) → all
if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $result = $bll->getById((int)$_GET['id']);
    } else {
        $result = $bll->getAll();
    }
    http_response_code($result['success'] ? 200 : 404);
    echo json_encode($result);
    exit;
}

// PATCH /{id} — update status (approve or reject)
if ($method === 'PATCH') {
    $parts  = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
    $id     = (int)($parts[0] ?? 0);
    $data   = json_decode(file_get_contents('php://input'), true) ?? [];
    $status = trim($data['status']      ?? '');
    $note   = isset($data['admin_note']) ? trim($data['admin_note']) : null;

    $result = $bll->updateStatus($id, $status, $note ?: null);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
