<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/InvestmentBLL.php';

header('Content-Type: application/json');

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new InvestmentBLL();

$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($method) {

    case 'GET':
        $investments = $bll->getByUser($userId);
        echo json_encode(['success' => true, 'investments' => $investments]);
        break;

    case 'POST':
        $result = $bll->create($userId, $data);
        echo json_encode($result);
        break;

    // Manual price update for real_estate / other
    case 'PATCH':
        $id    = (int)($_GET['id'] ?? 0);
        $price = isset($data['current_price']) ? (float)$data['current_price'] : -1;

        if ($price < 0) {
            echo json_encode(['success' => false, 'message' => 'current_price is required.']);
            break;
        }

        $result = $bll->updateManualPrice($userId, $id, $price);
        echo json_encode($result);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        $result = $bll->delete($userId, $id);
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}