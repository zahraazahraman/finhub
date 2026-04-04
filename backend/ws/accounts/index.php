<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/AccountBLL.php';

AuthMiddleware::verifyUser();

$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new AccountBLL();

if ($method === 'GET') {
    $accounts = $bll->getByUser($userId);
    echo json_encode(['success' => true, 'accounts' => $accounts]);

} elseif ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $result = $bll->create($userId, $data);
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);

} elseif ($method === 'DELETE') {
    $accountId = (int)($_GET['id'] ?? 0);
    $result    = $bll->delete($userId, $accountId);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}
