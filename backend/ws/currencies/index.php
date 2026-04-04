<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/CurrencyBLL.php';

AuthMiddleware::verifyUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$bll = new CurrencyBLL();
$currencies = $bll->getAll();

http_response_code(200);
echo json_encode(['success' => true, 'currencies' => $currencies]);
