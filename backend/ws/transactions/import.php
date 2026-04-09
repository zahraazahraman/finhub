<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../dal/TransactionDAL.php';
require_once __DIR__ . '/../../dal/AccountDAL.php';
require_once __DIR__ . '/../../dal/CategoryDAL.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

AuthMiddleware::verifyUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$user      = AuthMiddleware::getUser();
$userId    = (int)$user['user_id'];
$accountId = (int)($_POST['account_id'] ?? 0);
error_log("account_id: " . $accountId . " | user_id: " . $userId . " | POST: " . print_r($_POST, true));


// ── Validate account belongs to user ──
$accountDAL = new AccountDAL();
$account    = $accountDAL->getById($accountId);
if (!$account || (int)$account['user_id'] !== $userId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Account not found.']);
    exit;
}

// ── Validate file ──
if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit;
}

$file     = $_FILES['file'];
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed  = ['csv', 'xlsx', 'xls'];
if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Only CSV, XLS, and XLSX files are allowed.']);
    exit;
}

// ── Parse file ──
try {
    $spreadsheet = IOFactory::load($file['tmp_name']);
    $sheet       = $spreadsheet->getActiveSheet();
    $rows        = $sheet->toArray(null, true, true, false);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Could not read file. Make sure it is a valid CSV or Excel file.']);
    exit;
}

if (count($rows) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File is empty or has no data rows.']);
    exit;
}

// ── Detect column mapping ──
$headerRow = array_map(fn($h) => strtolower(trim((string)$h)), $rows[0]);

$mappings = [
    'amount'           => ['amount', 'amt', 'sum', 'value'],
    'transaction_type' => ['transaction_type', 'type', 'kind'],
    'transaction_date' => ['transaction_date', 'date', 'transaction date', 'day'],
    'description'      => ['description', 'desc', 'note', 'notes', 'details'],
    'category'         => ['category', 'category_name', 'cat'],
];

$columnIndex = [];
foreach ($mappings as $field => $aliases) {
    foreach ($headerRow as $i => $header) {
        if (in_array($header, $aliases)) {
            $columnIndex[$field] = $i;
            break;
        }
    }
}

$required = ['amount', 'transaction_type', 'transaction_date'];
$missing  = array_filter($required, fn($f) => !isset($columnIndex[$f]));
if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Could not detect required columns: ' . implode(', ', $missing) . '. Please check your file headers.',
    ]);
    exit;
}

// ── Process rows ──
$transactionDAL = new TransactionDAL();
$categoryDAL    = new CategoryDAL();
$validTypes     = ['income', 'expense', 'transfer'];
$imported       = 0;
$skipped        = [];
$balanceDelta   = 0;

foreach (array_slice($rows, 1) as $rowIndex => $row) {
    $rowNum = $rowIndex + 2;

    $amount      = trim((string)($row[$columnIndex['amount']] ?? ''));
    $type        = strtolower(trim((string)($row[$columnIndex['transaction_type']] ?? '')));
    $date        = trim((string)($row[$columnIndex['transaction_date']] ?? ''));
    $description = isset($columnIndex['description']) ? trim((string)($row[$columnIndex['description']] ?? '')) : '';
    $categoryRaw = isset($columnIndex['category'])    ? trim((string)($row[$columnIndex['category']]    ?? '')) : '';

    // ── Validate required fields ──
    if (!is_numeric($amount) || (float)$amount <= 0) {
        $skipped[] = "Row $rowNum: Invalid amount.";
        continue;
    }
    if (!in_array($type, $validTypes)) {
        $skipped[] = "Row $rowNum: Invalid type '$type'.";
        continue;
    }

    // ── Validate and normalize date ──
    $parsedDate = null;
    $formats    = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y'];
    foreach ($formats as $fmt) {
        $d = DateTime::createFromFormat($fmt, $date);
        if ($d && $d->format($fmt) === $date) {
            $parsedDate = $d->format('Y-m-d');
            break;
        }
    }
    if (!$parsedDate) {
        $skipped[] = "Row $rowNum: Invalid date '$date'.";
        continue;
    }

    // ── Resolve category ──
    $categoryId = null;
    if (!empty($categoryRaw) && $type !== 'transfer') {
        $categoryName = ucfirst(strtolower($categoryRaw));
        $categoryId   = $categoryDAL->findByNameAndType($categoryName, $type, $userId);
        if (!$categoryId) {
            $categoryId = $categoryDAL->createAndReturnId($categoryName, $type, $userId);
        }
    }

    // ── Insert transaction ──
    $transactionDAL->create($accountId, $categoryId, (float)$amount, $type, $description, $parsedDate);
    $balanceDelta += ($type === 'income') ? (float)$amount : -(float)$amount;
    $imported++;
}

// ── Update account balance ──
if ($balanceDelta !== 0) {
    $accountDAL->updateBalance($accountId, $balanceDelta);
}

echo json_encode([
    'success'  => true,
    'imported' => $imported,
    'skipped'  => $skipped,
]);