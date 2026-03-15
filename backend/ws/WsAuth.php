<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../bll/AdminBLL.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    $bll    = new AdminBLL();
    $result = $bll->login($email, $password);

    if ($result['success']) {
        $_SESSION['admin'] = $result['user'];
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(401);
        echo json_encode($result);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);