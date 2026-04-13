<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/GoalBLL.php';

header('Content-Type: application/json');

AuthMiddleware::verifyUser();
$user    = AuthMiddleware::getUser();
$userId  = (int)$user['user_id'];
$method  = $_SERVER['REQUEST_METHOD'];
$bll     = new GoalBLL();

// ── Read request body once ──
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true) ?? [];

// ── Route: /api/goals/contributions ──
$originalUri = $_SERVER['HTTP_X_ORIGINAL_URI'] ?? $_SERVER['REQUEST_URI'] ?? '';
$isContributions = str_contains($originalUri, '/goals/contributions');

// Fallback: detect contributions by checking request parameters
if (!$isContributions) {
    if ($method === 'POST') {
        // Contribution POST has goal_id but no goal_name
        $isContributions = isset($data['goal_id']) && !isset($data['goal_name']);
    } elseif ($method === 'GET') {
        // Contribution GET has goal_id query parameter
        $isContributions = isset($_GET['goal_id']);
    } elseif ($method === 'DELETE') {
        // Contribution DELETE has contribution_id query parameter
        $isContributions = isset($_GET['contribution_id']);
    }
}

if ($isContributions) {
    switch ($method) {

        case 'GET':
            $goalId = (int)($_GET['goal_id'] ?? 0);
            if ($goalId <= 0) {
                echo json_encode(['success' => false, 'message' => 'goal_id is required.']);
                exit;
            }
            $result = $bll->getContributions($userId, $goalId);
            echo json_encode($result);
            break;

        case 'POST':
            $data['goal_id'] = $data['goal_id'] ?? 0;
            $result = $bll->addContribution($userId, $data);
            echo json_encode($result);
            break;

        case 'DELETE':
            $contributionId = (int)($_GET['contribution_id'] ?? 0);
            $result = $bll->deleteContribution($userId, $contributionId);
            echo json_encode($result);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    }
    exit;
}

// ── Route: /api/goals ──
switch ($method) {

    case 'GET':
        $goals = $bll->getByUser($userId);
        echo json_encode(['success' => true, 'goals' => $goals]);
        break;

    case 'POST':
        $result = $bll->create($userId, $data);
        echo json_encode($result);
        break;

    case 'DELETE':
        $goalId = (int)($_GET['id'] ?? 0);
        $result = $bll->delete($userId, $goalId);
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}