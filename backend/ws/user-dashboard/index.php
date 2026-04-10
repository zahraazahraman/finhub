<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/DashboardUserBLL.php';

AuthMiddleware::verifyUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$bll    = new DashboardUserBLL();

$from         = $_GET['from']          ?? null;
$to           = $_GET['to']            ?? null;
$categoryType = $_GET['category_type'] ?? 'expense';
$categoryId   = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;

// Sanitize category_id — treat 0 as null (no filter)
if ($categoryId !== null && $categoryId <= 0) {
    $categoryId = null;
}

$result = $bll->getSummary($userId, $from, $to, $categoryType, $categoryId);

http_response_code(200);
echo json_encode($result);
exit;
