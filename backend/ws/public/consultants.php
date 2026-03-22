<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $db   = Database::getInstance();
    $stmt = $db->query(
        "SELECT consultant_id, first_name, last_name, 
                email, specialization, rating
         FROM Consultants
         ORDER BY rating DESC
         LIMIT 3"
    );
    $consultants = $stmt->fetchAll();
    http_response_code(200);
    echo json_encode($consultants);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}
