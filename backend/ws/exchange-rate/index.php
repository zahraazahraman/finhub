<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

AuthMiddleware::requireUser();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$from   = strtoupper(trim($_GET['from'] ?? ''));
$to     = strtoupper(trim($_GET['to']   ?? ''));
$amount = (float)($_GET['amount'] ?? 0);

if (empty($from) || empty($to)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'from and to currency codes are required.']);
    exit;
}

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Amount must be greater than zero.']);
    exit;
}

// ── Try Frankfurter API first ──
$rate = tryFrankfurter($from, $to);

// ── Fall back to open-source currency API ──
if ($rate === null) {
    $rate = tryOpenSourceAPI($from, $to);
}

// ── If both fail, return error ──
if ($rate === null) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Could not fetch exchange rate. Please try again later.']);
    exit;
}

$convertedAmount = round($amount * $rate, 2);

echo json_encode([
    'success'          => true,
    'rate'             => $rate,
    'converted_amount' => $convertedAmount,
]);

// ── Helper: Try Frankfurter API ──
function tryFrankfurter(string $from, string $to): ?float {
    $supportedCurrencies = [
        'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
    ];

    // Only try if both currencies are in Frankfurter's supported list
    if (!in_array($from, $supportedCurrencies) || !in_array($to, $supportedCurrencies)) {
        return null;
    }

    $url      = FRANKFURTER_API_URL . "/latest?from={$from}&to={$to}";
    $response = @file_get_contents($url);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    if (!isset($data['rates'][$to])) {
        return null;
    }

    return (float)$data['rates'][$to];
}

// ── Helper: Try open-source currency API (fawazahmed0 v2 — Cloudflare Pages) ──
function tryOpenSourceAPI(string $from, string $to): ?float {
    $fromLower = strtolower($from);
    $toLower   = strtolower($to);
    $url       = FAWAZAHMED0_API_URL . "/{$fromLower}.min.json";

    $response = @file_get_contents($url);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    // Response: { "usd": { "eur": 0.92, ... } }
    if (!isset($data[$fromLower][$toLower])) {
        return null;
    }

    return (float)$data[$fromLower][$toLower];
}
