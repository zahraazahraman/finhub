<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->prepare(
        "SELECT user_id, first_name, last_name, email, status,
                preferred_currency_id, ai_tone, ai_data_sharing, weekly_summary_enabled, timezone
         FROM Users WHERE email = 'demo@finhub.app' LIMIT 1"
    );
    $stmt->execute();
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        http_response_code(503);
        echo json_encode(['success' => false, 'message' => 'Demo account unavailable.']);
        exit;
    }

    $_SESSION['user'] = [
        'user_id'                => $user['user_id'],
        'first_name'             => $user['first_name'],
        'last_name'              => $user['last_name'],
        'email'                  => $user['email'],
        'preferred_currency_id'  => (int) ($user['preferred_currency_id'] ?? 1),
        'ai_tone'                => $user['ai_tone']               ?? 'professional',
        'ai_data_sharing'        => (int) ($user['ai_data_sharing']        ?? 1),
        'weekly_summary_enabled' => (int) ($user['weekly_summary_enabled'] ?? 1),
        'timezone'               => $user['timezone']              ?? 'UTC',
    ];

    // Short-lived token — valid for the presentation window only (24 hours)
    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $db->prepare("DELETE FROM UserSessions WHERE user_id = :id")
       ->execute([':id' => (int) $user['user_id']]);

    $db->prepare(
        "INSERT INTO UserSessions (user_id, session_token, expires_at)
         VALUES (:user_id, :token, :expires)"
    )->execute([
        ':user_id' => (int) $user['user_id'],
        ':token'   => $token,
        ':expires' => $expires,
    ]);

    setcookie('finhub_token', $token, [
        'expires'  => time() + (24 * 60 * 60),
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'user'    => $_SESSION['user'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
