<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../bll/ConsultantApplicationBLL.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$payload = [
    'first_name'       => trim($data['first_name']       ?? ''),
    'last_name'        => trim($data['last_name']        ?? ''),
    'email'            => trim($data['email']            ?? ''),
    'phone'            => trim($data['phone']            ?? ''),
    'specialization'   => trim($data['specialization']   ?? ''),
    'years_experience' => (int)($data['years_experience'] ?? 0),
    'bio'              => trim($data['bio']              ?? ''),
    'motivation'       => trim($data['motivation']       ?? ''),
    'linkedin_url'     => trim($data['linkedin_url']     ?? ''),
];

$bll = new ConsultantApplicationBLL();
echo json_encode($bll->submit($payload));
