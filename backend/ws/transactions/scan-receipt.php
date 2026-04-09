<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

AuthMiddleware::verifyUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── Validate file ──
if (empty($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No image uploaded.']);
    exit;
}

$file    = $_FILES['image'];
$ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, and WEBP images are allowed.']);
    exit;
}

// ── Read and encode image ──
$imageData  = base64_encode(file_get_contents($file['tmp_name']));
$mimeType   = mime_content_type($file['tmp_name']);
$apiKey = $_ENV['GROQ_API_KEY'] ?? '';

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'AI service not configured.']);
    exit;
}

// ── Call Groq Vision API ──
$prompt = "You are a receipt parser. Extract the following information from this receipt image:
- total_amount: the final total amount paid (number only, no currency symbol)
- currency: the currency code if visible (e.g. USD, LBP, EUR), or null if not found
- date: the transaction date in YYYY-MM-DD format, or null if not found
- description: the store or merchant name, or a short description of the purchase
- category: a simple spending category like Food & Drinks, Transport, Entertainment, Clothing, etc.

Return ONLY a valid JSON object with these exact keys. No explanation, no markdown, no extra text.
Example: {\"total_amount\": 9.70, \"currency\": \"USD\", \"date\": \"2026-03-10\", \"description\": \"SuperMart\", \"category\": \"Food & Drinks\"}";

$payload = [
    'model'    => 'llama-3.3-70b-versatile',
    'messages' => [
        [
            'role'    => 'user',
            'content' => $prompt,
        ]
    ],
    'temperature' => 0.1,
];

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
    'Expect:',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
error_log("Groq HTTP code: " . $httpCode . " | Response: " . substr($response, 0, 500));
curl_close($ch);

if (!$response || $httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to analyze receipt. Please try again.']);
    exit;
}

// ── Parse Groq response ──
$groqData = json_decode($response, true);
$text     = $groqData['choices'][0]['message']['content'] ?? '';
$text     = trim(preg_replace('/```json|```/', '', $text));

$extracted = json_decode($text, true);

if (!$extracted || !isset($extracted['total_amount'])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Could not extract data from receipt. Please try manually.']);
    exit;
}

echo json_encode([
    'success' => true,
    'data'    => [
        'amount'      => $extracted['total_amount']  ?? null,
        'currency'    => $extracted['currency']       ?? null,
        'date'        => $extracted['date']           ?? date('Y-m-d'),
        'description' => $extracted['description']   ?? '',
        'category'    => $extracted['category']      ?? '',
    ],
]);