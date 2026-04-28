<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/InvestmentBLL.php';

header('Content-Type: application/json');

AuthMiddleware::verifyUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$bll    = new InvestmentBLL();
$result = $bll->updatePrices($userId);
echo json_encode($result);