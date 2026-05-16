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

    if ($action === 'getOne') {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid consultant id.']);
            exit;
        }
        echo json_encode($bll->getOne($id));
        exit;
    }

    if ($action === 'matchByNeed') {
        $need = trim($_GET['need'] ?? '');
        if ($need === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'need parameter is required.']);
            exit;
        }
        echo json_encode($bll->matchByNeed($need));
        exit;
    }

    // Default: list all with optional ?specialization= filter
    $specialization = isset($_GET['specialization']) && $_GET['specialization'] !== ''
        ? $_GET['specialization']
        : null;

    echo json_encode($bll->getAll($specialization));
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
