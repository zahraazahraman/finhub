<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/BillBLL.php';

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new BillBLL();
$data   = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($method) {

    case 'GET':
        $action = $_GET['action'] ?? '';
        if ($action === 'categories') {
            $result = $bll->getExpenseCategories();
            echo json_encode($result);
            break;
        }

        $bills = $bll->getByUser($userId);
        echo json_encode(['success' => true, 'bills' => $bills]);
        break;

    case 'POST':
        $result = $bll->create($userId, $data);
        echo json_encode($result);
        break;

    case 'PATCH':
        $billId = (int)($_GET['id'] ?? 0);
        $action = $data['action'] ?? '';
        if ($action === 'mark_paid') {
            $result = $bll->markAsPaid($userId, $billId);
        } elseif ($action === 'mark_unpaid') {
            $result = $bll->markAsUnpaid($userId, $billId);
        } elseif ($action === 'update_bill') {
            $result = $bll->update($userId, $billId, $data);
        } else {
            $result = ['success' => false, 'message' => 'Invalid action.'];
        }
        echo json_encode($result);
        break;

    case 'DELETE':
        $billId = (int)($_GET['id'] ?? 0);
        $result = $bll->delete($userId, $billId);
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}