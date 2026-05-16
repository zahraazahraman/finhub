<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../bll/ConsultantProfileBLL.php';

AuthMiddleware::requireConsultant();

$consultant   = AuthMiddleware::getConsultant();
$consultantId = (int)$consultant['consultant_id'];
$method       = $_SERVER['REQUEST_METHOD'];
$bll          = new ConsultantProfileBLL();

if ($method === 'GET') {
    $result = $bll->get($consultantId);
    http_response_code($result['success'] ? 200 : 404);
    echo json_encode($result);
    exit;
}

if ($method === 'PUT') {
    $data   = json_decode(file_get_contents('php://input'), true) ?? [];
    $result = $bll->update($consultantId, $data);

    // Sync updated name/specialization into the active session
    if ($result['success'] && !empty($result['updated'])) {
        $_SESSION['consultant']['first_name']    = $result['updated']['first_name'];
        $_SESSION['consultant']['last_name']     = $result['updated']['last_name'];
        $_SESSION['consultant']['specialization'] = $result['updated']['specialization'];
    }

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
