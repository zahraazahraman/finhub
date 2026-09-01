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

$data         = json_decode(file_get_contents('php://input'), true) ?? [];
$investmentId = (int)($data['investment_id'] ?? 0);

if ($investmentId <= 0) {
    echo json_encode(['success' => false, 'message' => 'investment_id is required.']);
    exit;
}

$dal        = new InvestmentDAL();
$investment = $dal->getById($investmentId);

if (!$investment || (int)$investment['user_id'] !== $userId) {
    echo json_encode(['success' => false, 'message' => 'Investment not found.']);
    exit;
}

// ── Compute metrics ──
$qty          = (float)$investment['quantity'];
$buyPrice     = (float)$investment['purchase_price'];
$curPrice     = $investment['current_price'] !== null ? (float)$investment['current_price'] : $buyPrice;
$costBasis    = round($qty * $buyPrice, 2);
$currentValue = round($qty * $curPrice, 2);
$profitLoss   = round($currentValue - $costBasis, 2);
$roi          = $buyPrice > 0 ? round((($curPrice - $buyPrice) / $buyPrice) * 100, 2) : 0;

$investmentData = [
    'name'           => $investment['investment_name'],
    'symbol'         => $investment['symbol'],
    'type'           => $investment['investment_type'],
    'quantity'       => $qty,
    'purchase_price' => $buyPrice,
    'current_price'  => $curPrice,
    'currency'       => $investment['currency_code'],
    'cost_basis'     => $costBasis,
    'current_value'  => $currentValue,
    'profit_loss'    => $profitLoss,
    'roi_percent'    => $roi,
    'purchase_date'  => $investment['purchase_date'],
    'notes'          => $investment['notes'],
];

// ── Read user tone preference (safe fallback for pre-migration sessions) ──
$aiTone = $_SESSION['user']['ai_tone'] ?? 'professional';

// ── Build tone instruction ──
$toneInstruction = '';
if ($aiTone === 'simple') {
    $toneInstruction =
        "IMPORTANT — LANGUAGE STYLE: The user reading this analysis is a complete beginner in investing. " .
        "Write all text fields (performance_summary, market_context, action_advice, and key_factors) in simple, plain, everyday language. " .
        "Avoid financial jargon entirely. If you must use a term like ROI (Return on Investment), P/L (Profit or Loss), " .
        "or any other financial concept, explain it in plain words immediately after in parentheses. " .
        "Keep sentences short. Be warm, encouraging, and easy to understand.\n\n";
}

// ── Build prompt ──
$prompt =
    $toneInstruction .
    "You are a professional financial analyst. Perform a deep analysis of this single investment.\n\n" .
    "Investment data:\n" . json_encode($investmentData, JSON_PRETTY_PRINT) . "\n\n" .
    "Provide a thorough analysis covering:\n" .
    "1. recommendation: exactly \"buy\", \"hold\", or \"sell\"\n" .
    "2. risk_level: exactly \"low\", \"medium\", or \"high\"\n" .
    "3. performance_summary: 2-3 sentences evaluating ROI, profit/loss, and overall performance\n" .
    "4. market_context: 2-3 sentences on the current market conditions relevant to this asset type and symbol\n" .
    "5. action_advice: 2-3 sentences of specific, actionable next steps for this investor\n" .
    "6. key_factors: array of exactly 3 short strings (max 10 words each) listing the main factors driving your recommendation\n\n" .
    "Respond ONLY with valid JSON, no markdown, no extra text:\n" .
    "{\n" .
    "  \"recommendation\": \"hold\",\n" .
    "  \"risk_level\": \"medium\",\n" .
    "  \"performance_summary\": \"...\",\n" .
    "  \"market_context\": \"...\",\n" .
    "  \"action_advice\": \"...\",\n" .
    "  \"key_factors\": [\"...\", \"...\", \"...\"]\n" .
    "}";

// ── Call Groq API ──
$apiKey = $_ENV['GROQ_API_KEY'] ?? '';
if (empty($apiKey)) {
    echo json_encode(['success' => false, 'message' => 'AI service is not configured.']);
    exit;
}

$body = [
    'model'       => GROQ_MODEL,
    'temperature' => 0.3,
    'max_tokens'  => 1000,
    'messages'    => [
        ['role' => 'user', 'content' => $prompt],
    ],
];

// gpt-oss models burn hidden "reasoning" tokens before answering. Capping the
// effort to 'low' saves tokens and latency with no quality loss for this strict
// JSON task. Guarded so a non-gpt-oss GROQ_MODEL never receives the param.
if (str_starts_with(GROQ_MODEL, 'openai/gpt-oss')) {
    $body['reasoning_effort'] = 'low';
}

$payload = json_encode($body);

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

if (!$analysis || !isset($analysis['recommendation'])) {
    echo json_encode(['success' => false, 'message' => 'Could not parse AI response. Please try again.']);
    exit;
}

echo json_encode(['success' => true, 'analysis' => $analysis]);