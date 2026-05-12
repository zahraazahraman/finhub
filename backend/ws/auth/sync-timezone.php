<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

AuthMiddleware::requireUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$timezone = trim($body['timezone'] ?? '');

if (!$timezone || !in_array($timezone, timezone_identifiers_list(), true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid timezone.']);
    exit;
}

$user = AuthMiddleware::getUser();

// No-op if timezone hasn't actually changed — avoids unnecessary writes.
if (($user['timezone'] ?? 'UTC') === $timezone) {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

try {
    $db = Database::getInstance();
    $db->prepare("UPDATE Users SET timezone = :tz WHERE user_id = :id")
       ->execute([':tz' => $timezone, ':id' => (int)$user['user_id']]);

    // Keep session in sync so the current request cycle is also aware.
    $_SESSION['user']['timezone'] = $timezone;

    http_response_code(200);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}