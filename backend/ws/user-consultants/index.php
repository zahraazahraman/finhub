<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/UserConsultantBLL.php';

AuthMiddleware::requireUser();

$method = $_SERVER['REQUEST_METHOD'];
$bll    = new UserConsultantBLL();

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'specializations') {
        echo json_encode($bll->getSpecializations());
        exit;
    }

    // Optional ?specialization=Investment filter
    $specialization = isset($_GET['specialization']) && $_GET['specialization'] !== ''
        ? $_GET['specialization']
        : null;

    echo json_encode($bll->getAll($specialization));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);