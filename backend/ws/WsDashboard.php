<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/DashboardBLL.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new DashboardBLL();

if ($method === 'GET') {
    $year   = (int)($_GET['year'] ?? date('Y'));
    $from   = $_GET['from'] ?? null;
    $to     = $_GET['to']   ?? null;

    // Validate dates
    if ($from && !strtotime($from)) $from = null;
    if ($to   && !strtotime($to))   $to   = null;

    $result = $bll->getSummary($year, $from, $to);
    http_response_code(200);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
