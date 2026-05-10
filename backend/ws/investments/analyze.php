<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../dal/InvestmentDAL.php';

header('Content-Type: application/json');

AuthMiddleware::requireUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$dal         = new InvestmentDAL();
$investments = $dal->getByUser($userId);

if (empty($investments)) {
    echo json_encode(['success' => false, 'message' => 'No investments to analyze.']);
    exit;
}

// ── Build portfolio data with computed metrics ──
$portfolioData = [];
foreach ($investments as $inv) {
    $qty          = (float)$inv['quantity'];
    $buyPrice     = (float)$inv['purchase_price'];
    $currentPrice = $inv['current_price'] !== null ? (float)$inv['current_price'] : $buyPrice;
    $costBasis    = round($qty * $buyPrice, 2);
    $currentValue = round($qty * $currentPrice, 2);
    $profitLoss   = round($currentValue - $costBasis, 2);
    $roi          = $buyPrice > 0
                        ? round((($currentPrice - $buyPrice) / $buyPrice) * 100, 2)
                        : 0;

    $portfolioData[] = [
        'investment_id'  => (int)$inv['investment_id'],
        'name'           => $inv['investment_name'],
        'symbol'         => $inv['symbol'],
        'type'           => $inv['investment_type'],
        'quantity'       => $qty,
        'purchase_price' => $buyPrice,
        'current_price'  => $currentPrice,
        'currency'       => $inv['currency_code'],
        'cost_basis'     => $costBasis,
        'current_value'  => $currentValue,
        'profit_loss'    => $profitLoss,
        'roi_percent'    => $roi,
        'purchase_date'  => $inv['purchase_date'],
        'notes'          => $inv['notes'],
    ];
}

// ── Read user tone preference (safe fallback for pre-migration sessions) ──
$aiTone = $_SESSION['user']['ai_tone'] ?? 'professional';

// ── Build prompt ──
$toneInstruction = '';
if ($aiTone === 'simple') {
    $toneInstruction =
        "IMPORTANT — LANGUAGE STYLE: The user reading this analysis is a complete beginner in investing. " .
        "Write all text fields (reasoning, portfolio_summary, diversification_note) in simple, plain, everyday language. " .
        "Avoid financial jargon entirely. If you must use a financial term such as ROI (Return on Investment), " .
        "P/L (Profit or Loss), or diversification, explain it in plain words immediately after in parentheses. " .
        "Keep sentences short. Be encouraging and easy to understand.\n\n";
}

$prompt =
    $toneInstruction .
    "You are a professional financial analyst. Analyze this investment portfolio and provide clear, actionable recommendations.\n\n" .
    "Portfolio data:\n" . json_encode($portfolioData, JSON_PRETTY_PRINT) . "\n\n" .
    "For each investment provide:\n" .
    "- recommendation: exactly \"buy\", \"hold\", or \"sell\"\n" .
    "- reasoning: 2-3 sentence explanation based on ROI, type, and performance\n" .
    "- risk_level: exactly \"low\", \"medium\", or \"high\"\n\n" .
    "Also provide:\n" .
    "- portfolio_summary: 2-3 sentences on overall portfolio health\n" .
    "- diversification_note: 1-2 sentences on portfolio diversification\n\n" .
    "Respond ONLY with valid JSON, no markdown, no extra text:\n" .
    "{\n" .
    "  \"investments\": [\n" .
    "    {\"investment_id\": 1, \"recommendation\": \"hold\", \"reasoning\": \"...\", \"risk_level\": \"medium\"}\n" .
    "  ],\n" .
    "  \"portfolio_summary\": \"...\",\n" .
    "  \"diversification_note\": \"...\"\n" .
    "}";

// ── Call Groq API ──
$apiKey = $_ENV['GROQ_API_KEY'] ?? '';
if (empty($apiKey)) {
    echo json_encode(['success' => false, 'message' => 'AI service is not configured.']);
    exit;
}

$payload = json_encode([
    'model'       => 'llama-3.3-70b-versatile',
    'temperature' => 0.3,
    'max_tokens'  => 2000,
    'messages'    => [
        ['role' => 'user', 'content' => $prompt],
    ],
]);

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response || $httpCode !== 200) {
    echo json_encode(['success' => false, 'message' => 'AI analysis failed. Please try again.']);
    exit;
}

$groqData = json_decode($response, true);
$content  = trim($groqData['choices'][0]['message']['content'] ?? '');

$content = preg_replace('/^```(?:json)?\s*/i', '', $content);
$content = preg_replace('/\s*```$/i', '', trim($content));

$analysis = json_decode($content, true);

if (!$analysis || !isset($analysis['investments'])) {
    echo json_encode(['success' => false, 'message' => 'Could not parse AI response. Please try again.']);
    exit;
}

echo json_encode(['success' => true, 'analysis' => $analysis]);