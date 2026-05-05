<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/ProfileBLL.php';

header('Content-Type: application/json');

AuthMiddleware::verifyUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$bll    = new ProfileBLL();

// ── GET — fetch full profile ──
if ($method === 'GET') {
    echo json_encode($bll->getProfile($userId));
    exit;
}

// ── PATCH — partial updates by action ──
if ($method === 'PATCH') {
    $data   = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $data['action'] ?? '';

    // Update name
    if ($action === 'name') {
        $result = $bll->updateName(
            $userId,
            $data['first_name'] ?? '',
            $data['last_name']  ?? ''
        );
        // Sync PHP session so subsequent requests see the new name
        if ($result['success']) {
            $_SESSION['user']['first_name'] = $result['first_name'];
            $_SESSION['user']['last_name']  = $result['last_name'];
        }
        echo json_encode($result);
        exit;
    }

    // Update password
    if ($action === 'password') {
        $result = $bll->updatePassword(
            $userId,
            $data['current_password'] ?? '',
            $data['new_password']     ?? '',
            $data['confirm_password'] ?? ''
        );
        echo json_encode($result);
        exit;
    }

    // Update preferences
    if ($action === 'preferences') {
        $result = $bll->updatePreferences($userId, $data);
        // Sync PHP session so AI calls in the same session use the new settings immediately
        if ($result['success']) {
            $_SESSION['user']['preferred_currency_id']  = $result['preferred_currency_id'];
            $_SESSION['user']['ai_tone']                = $result['ai_tone'];
            $_SESSION['user']['ai_data_sharing']        = $result['ai_data_sharing'];
            $_SESSION['user']['weekly_summary_enabled'] = $result['weekly_summary_enabled'];
        }
        echo json_encode($result);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);