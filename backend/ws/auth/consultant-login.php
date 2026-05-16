<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT consultant_id, first_name, last_name, email,
                password, must_change_password, specialization
         FROM Consultants
         WHERE email = :email
         LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$consultant || !$consultant['password'] || !password_verify($password, $consultant['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
        exit;
    }

    $_SESSION['consultant'] = [
        'consultant_id'       => (int) $consultant['consultant_id'],
        'first_name'          => $consultant['first_name'],
        'last_name'           => $consultant['last_name'],
        'email'               => $consultant['email'],
        'specialization'      => $consultant['specialization'],
        'must_change_password' => (int) $consultant['must_change_password'],
    ];

    http_response_code(200);
    echo json_encode([
        'success'              => true,
        'consultant'           => $_SESSION['consultant'],
        'must_change_password' => (int) $consultant['must_change_password'] === 1,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
