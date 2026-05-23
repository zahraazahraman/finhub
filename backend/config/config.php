<?php
// ── Load .env ──
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Frontend origin — used for email links. Never derive this from HTTP_HOST.
defined('APP_URL') || define('APP_URL', $_ENV['APP_URL'] ?? 'http://localhost:5173');

// ── External API base URLs ──
// Public, keyless APIs — same in every environment.
// Centralised here so a URL change (like fawazahmed0 v1→v2) is a one-line fix.
defined('FRANKFURTER_API_URL')  || define('FRANKFURTER_API_URL',  'https://api.frankfurter.app');
defined('FAWAZAHMED0_API_URL')  || define('FAWAZAHMED0_API_URL',  'https://latest.currency-api.pages.dev/v1/currencies');

$isProduction = ($_ENV['APP_ENV'] ?? 'local') === 'production';

// Hide errors in production so stack traces are never exposed publicly.
ini_set('display_errors', $isProduction ? '0' : '1');
error_reporting($isProduction ? 0 : E_ALL);

// Ensure PHP uses UTC for all date/time operations to match the database session.
date_default_timezone_set('UTC');

// Secure session cookies in production (requires HTTPS).
if ($isProduction) {
    ini_set('session.cookie_secure',   '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
}

// CORS — same origin in production, localhost in development.
$allowedOrigin = $isProduction
    ? ($_ENV['APP_URL'] ?? 'https://finhubapp.app')
    : 'http://localhost:5173';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }