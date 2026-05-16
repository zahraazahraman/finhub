<?php
session_start();
require_once __DIR__ . '/../../config/config.php';

unset($_SESSION['consultant']);

http_response_code(200);
echo json_encode(['success' => true]);
