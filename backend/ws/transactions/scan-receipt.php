<?php
ob_start();
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

AuthMiddleware::requireUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── Validate file ──
if (empty($_FILES['image'])) {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No image uploaded.']);
    exit;
}

$file    = $_FILES['image'];
$ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

if (!in_array($ext, $allowed)) {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, WEBP, and HEIC images are allowed.']);
    exit;
}

// ── Convert HEIC to JPEG before OCR ──
$tmpImage    = $file['tmp_name'];
$heicTmpPath = null;

if ($ext === 'heic') {
    // sips requires a .heic extension on the input — copy the upload temp file first.
    // Use the same dir as the upload file since XAMPP can write there.
    $tmpDir        = dirname($file['tmp_name']);
    $heicInputPath = $tmpDir . '/heic_in_'  . uniqid() . '.heic';
    $heicTmpPath   = $tmpDir . '/heic_out_' . uniqid() . '.jpg';
    copy($tmpImage, $heicInputPath);

    $converted = false;

    if (PHP_OS === 'Darwin') {
        $cmd = '/usr/bin/sips -s format jpeg ' . escapeshellarg($heicInputPath) . ' --out ' . escapeshellarg($heicTmpPath) . ' 2>&1';
        exec($cmd, $out, $sipsStatus);
        $converted = (file_exists($heicTmpPath) && filesize($heicTmpPath) > 0);
    }

    if (!$converted) {
        $cmd = 'convert ' . escapeshellarg($heicInputPath) . ' ' . escapeshellarg($heicTmpPath) . ' 2>&1';
        exec($cmd, $out, $sipsStatus);
        $converted = (file_exists($heicTmpPath) && filesize($heicTmpPath) > 0);
    }

    @unlink($heicInputPath);

    if (!$converted) {
        ob_end_clean(); header('Content-Type: application/json');
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Could not process HEIC image. Please convert it to JPG first.']);
        exit;
    }

    $tmpImage = $heicTmpPath;
}

// ── Step 1: OCR with Tesseract ──
$tesseractCandidates = [
    trim(shell_exec('which tesseract 2>/dev/null') ?: ''),
    '/usr/local/bin/tesseract',   // Homebrew on Intel Mac
    '/opt/homebrew/bin/tesseract', // Homebrew on Apple Silicon
    '/usr/bin/tesseract',          // Linux / system install
];
$tesseract = '/usr/bin/tesseract';
foreach ($tesseractCandidates as $candidate) {
    if ($candidate && file_exists($candidate)) {
        $tesseract = $candidate;
        break;
    }
}
$libPrefix = PHP_OS === 'Darwin' ? 'DYLD_LIBRARY_PATH=/usr/local/lib ' : '';
$cmd       = $libPrefix . $tesseract . ' ' . escapeshellarg($tmpImage) . ' stdout -l eng 2>&1';
exec($cmd, $ocrLines, $ocrStatus);

if ($ocrStatus !== 0 || empty($ocrLines)) {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'OCR failed. Make sure Tesseract is installed.']);
    exit;
}

$ocrText = implode("\n", $ocrLines);

// Clean up HEIC temp file — no longer needed after OCR
if ($heicTmpPath && file_exists($heicTmpPath)) {
    @unlink($heicTmpPath);
}

if (trim($ocrText) === '') {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Could not read text from image. Try a clearer photo.']);
    exit;
}

// ── Step 2: Send extracted text to Groq to structure it ──
$apiKey = $_ENV['GROQ_API_KEY'] ?? '';
if (empty($apiKey)) {
    ob_end_clean(); header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'AI service not configured.']);
    exit;
}

$systemPrompt = "You are a receipt parser. The user will provide raw text extracted from a receipt via OCR. Parse it and extract:
- total_amount: the final total amount paid (number only, no currency symbol)
- currency: the currency code if visible (e.g. USD, LBP, EUR), or null if not found
- date: the transaction date in YYYY-MM-DD format, or null if not found
- description: the store or merchant name, or a short description of the purchase
- category: a simple spending category like Food & Drinks, Transport, Entertainment, Clothing, etc.

Return ONLY a valid JSON object with these exact keys. No explanation, no markdown, no extra text.
Example: {\"total_amount\": 9.70, \"currency\": \"USD\", \"date\": \"2026-03-10\", \"description\": \"SuperMart\", \"category\": \"Food & Drinks\"}";

$payload = [
    'model'      => 'llama-3.3-70b-versatile',
    'messages'   => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user',   'content' => substr($ocrText, 0, 4000)],
    ],
    'temperature' => 0.1,
    'max_tokens'  => 200,
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
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_errno($ch);
curl_close($ch);

ob_end_clean();
header('Content-Type: application/json');

if ($curlError) {
    http_response_code(504);
    echo json_encode(['success' => false, 'message' => 'Could not reach AI service. Please try again.']);
    exit;
}

if (!$response || $httpCode !== 200) {
    $groqError = $response ? (json_decode($response, true)['error']['message'] ?? $response) : 'No response from Groq';
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Groq error: ' . $groqError]);
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