<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../services/Mailer.php';
require_once __DIR__ . '/../../services/EmailTemplates.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$name    = trim($body['name']    ?? '');
$email   = trim($body['email']   ?? '');
$message = trim($body['message'] ?? '');

// ── Validation ──
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($message) < 10) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Message is too short.']);
    exit;
}

if (strlen($message) > 2000) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Message must be under 2000 characters.']);
    exit;
}

// ── Send ──
$html = EmailTemplates::contactMessage(
    htmlspecialchars($name),
    htmlspecialchars($email),
    nl2br(htmlspecialchars($message))
);

$sent = Mailer::send(
    'contact@finhubapp.app',
    'FinHub Contact',
    "New message from {$name}",
    $html,
    $email  // reply-to: so replying goes directly to the sender
);

if (!$sent) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send message. Please try again.']);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
