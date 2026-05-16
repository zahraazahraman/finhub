<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

if (AuthMiddleware::isConsultant()) {
    echo json_encode(['success' => true, 'consultant' => AuthMiddleware::getConsultant()]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false]);
}
