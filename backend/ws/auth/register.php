<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$firstName = trim($body['first_name'] ?? '');
$lastName  = trim($body['last_name']  ?? '');
$email     = trim($body['email']      ?? '');
$password  = trim($body['password']   ?? '');
$phone     = trim($body['phone']      ?? '');

// Validation
if (!$firstName || !$lastName || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

try {
    $db = Database::getInstance();

    // Check if email already exists
    $check = $db->prepare("SELECT user_id FROM Users WHERE email = :email");
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered.']);
        exit;
    }

    // Insert user
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare(
        "INSERT INTO Users (first_name, last_name, email, password_hash, phone_number)
         VALUES (:first_name, :last_name, :email, :password_hash, :phone)"
    );
    $stmt->execute([
        ':first_name'    => $firstName,
        ':last_name'     => $lastName,
        ':email'         => $email,
        ':password_hash' => $hash,
        ':phone'         => $phone ?: null,
    ]);

    $userId = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'user'    => [
            'user_id'    => $userId,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'email'      => $email,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
