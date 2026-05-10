<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── Delete the persistent token from the database ──
$token = $_COOKIE['finhub_token'] ?? null;
if ($token) {
    try {
        $db = Database::getInstance();
        $db->prepare("DELETE FROM UserSessions WHERE session_token = :token")
           ->execute([':token' => $token]);
    } catch (Exception $e) {
        // Non-fatal — the session is destroyed below regardless.
    }
}

// ── Expire the cookie in the browser ──
setcookie('finhub_token', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);

// ── Destroy the PHP session ──
session_destroy();

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);