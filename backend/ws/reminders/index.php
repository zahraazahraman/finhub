<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/BillBLL.php';

AuthMiddleware::verifyUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new BillBLL();
$data   = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($method) {

    case 'GET':
        $billId = (int)($_GET['bill_id'] ?? 0);
        if ($billId <= 0) {
            echo json_encode(['success' => false, 'message' => 'bill_id is required.']);
            break;
        }
        echo json_encode($bll->getReminders($userId, $billId));
        break;

    case 'POST':
        $billId = (int)($data['bill_id'] ?? 0);
        echo json_encode($bll->addReminder($userId, $billId, $data));
        break;

    case 'PATCH':
        // Update a reminder
        $reminderId = (int)($_GET['id'] ?? ($data['reminder_id'] ?? 0));
        echo json_encode($bll->updateReminder($userId, $reminderId, $data));
        break;

    case 'DELETE':
        $reminderId = (int)($_GET['id'] ?? 0);
        echo json_encode($bll->deleteReminder($userId, $reminderId));
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}