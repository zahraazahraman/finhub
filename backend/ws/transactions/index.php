<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/TransactionBLL.php';

AuthMiddleware::verifyUser();

$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new TransactionBLL();

if ($method === 'GET') {
    $accountId    = (int)($_GET['account_id'] ?? 0);
    $transactions = $bll->getByAccount($userId, $accountId);
    echo json_encode(['success' => true, 'transactions' => $transactions]);

} elseif ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $result = $bll->create($userId, $data);
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);

} elseif ($method === 'DELETE') {
    $transactionId = (int)($_GET['id'] ?? 0);
    $result        = $bll->delete($userId, $transactionId);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}
