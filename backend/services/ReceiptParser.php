<?php
/**
 * ReceiptParser — shared receipt OCR + AI parsing pipeline.
 *
 * Used by BOTH:
 *   • the production endpoint  (backend/ws/transactions/scan-receipt.php)
 *   • the benchmark harness    (benchmark_receipt.php)
 * so they always execute the exact same logic — keeping the reported
 * benchmark numbers faithful to what production actually runs.
 *
 *   Stage 1 — Tesseract OCR
 *   Stage 2 — Groq LLM structuring (model set by GROQ_MODEL in config.php)
 *
 * The class performs NO HTTP output and NO printing — it returns a result
 * array and lets each caller decide how to present it.
 */
class ReceiptParser {

    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic'];


    /**
     * Parse a receipt image into structured fields.
     *
     * @param string      $imagePath Absolute path to the image on disk.
     * @param string|null $extHint   Optional extension (e.g. for uploaded temp
     *                               files whose path has no extension). Falls
     *                               back to the path's own extension.
     *
     * @return array{
     *   ok:bool, errorCode:?int, error:?string,
     *   data:?array{total_amount:mixed,currency:?string,date:?string,description:?string,category:?string},
     *   timing:array{ocr:float,groq:float,total:float},
     *   ocrText:string, wordCount:int, raw:string
     * }
     */
    public static function parse(string $imagePath, ?string $extHint = null): array {
        self::loadEnv();
        $totalStart = microtime(true);

        if (!file_exists($imagePath)) {
            return self::err(400, 'File not found.');
        }

        $ext = strtolower($extHint ?? pathinfo($imagePath, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true)) {
            return self::err(400, 'Only JPG, PNG, WEBP, and HEIC images are allowed.');
        }

        // ── HEIC → JPEG (Tesseract cannot read HEIC) ──
        $workImage = $imagePath;
        $heicTmp   = null;
        if ($ext === 'heic') {
            $heicTmp = self::convertHeic($imagePath);
            if ($heicTmp === null) {
                return self::err(422, 'Could not process HEIC image. Please convert it to JPG first.');
            }
            $workImage = $heicTmp;
        }

        // ── Stage 1: pre-process (GD) + Tesseract OCR ──
        $ocrStart = microtime(true);
        $preImage = self::preprocess($workImage);       // cleaned image; null if GD unavailable/failed
        $ocrInput = $preImage ?? $workImage;            // fail-safe: fall back to the original
        [$ocrStatus, $ocrText] = self::runOcr($ocrInput);
        $ocrTime = microtime(true) - $ocrStart;          // includes preprocessing (part of the OCR stage)

        if ($preImage && file_exists($preImage)) { @unlink($preImage); }
        if ($heicTmp  && file_exists($heicTmp))  { @unlink($heicTmp); }

        if ($ocrStatus !== 0) {
            return self::err(500, 'OCR failed. Make sure Tesseract is installed.');
        }
        if (trim($ocrText) === '') {
            return [
                'ok' => false, 'errorCode' => 422,
                'error' => 'Could not read text from image. Try a clearer photo.',
                'data' => null,
                'timing' => ['ocr' => $ocrTime, 'groq' => 0.0, 'total' => microtime(true) - $totalStart],
                'ocrText' => '', 'wordCount' => 0, 'raw' => '',
            ];
        }

        // ── Stage 2: Groq structuring ──
        $apiKey = $_ENV['GROQ_API_KEY'] ?? '';
        if (empty($apiKey)) {
            return self::err(500, 'AI service not configured.');
        }

        $groqStart = microtime(true);
        [$curlError, $httpCode, $response] = self::callGroq($apiKey, $ocrText);
        $groqTime = microtime(true) - $groqStart;

        if ($curlError) {
            return self::err(504, 'Could not reach AI service. Please try again.');
        }
        if (!$response || $httpCode !== 200) {
            $msg = $response
                ? (json_decode($response, true)['error']['message'] ?? $response)
                : 'No response from Groq';
            return self::err(500, 'Groq error: ' . $msg);
        }

        $groqData = json_decode($response, true);
        $text     = $groqData['choices'][0]['message']['content'] ?? '';
        $text     = trim(preg_replace('/```json|```/', '', $text));
        $extracted = json_decode($text, true);

        $totalTime = microtime(true) - $totalStart;
        $timing    = ['ocr' => $ocrTime, 'groq' => $groqTime, 'total' => $totalTime];

        if (!is_array($extracted)) {
            return [
                'ok' => false, 'errorCode' => 422,
                'error' => 'Could not parse the AI response. Please try manually.',
                'data' => null, 'timing' => $timing,
                'ocrText' => $ocrText, 'wordCount' => str_word_count($ocrText), 'raw' => $text,
            ];
        }

        // Sanitize each field — keep whatever the model extracted, even if the
        // amount is missing (partial data is still useful and is scored fairly).
        return [
            'ok' => true, 'errorCode' => null, 'error' => null,
            'data' => [
                'total_amount' => self::sanitizeAmount($extracted['total_amount'] ?? null),
                'currency'     => self::cleanStr($extracted['currency']     ?? null),
                'date'         => self::sanitizeDate($extracted['date']      ?? null),
                'description'  => self::cleanStr($extracted['description']  ?? null),
                'category'     => self::cleanStr($extracted['category']     ?? null),
            ],
            'timing'    => $timing,
            'ocrText'   => $ocrText,
            'wordCount' => str_word_count($ocrText),
            'raw'       => $text,
        ];
    }

    /** Amount → positive float, or null. Handles thousands separators ('.'/','). 0 → null. */
    private static function sanitizeAmount($v): ?float {
        if ($v === null || $v === '') return null;
        $s = preg_replace('/[^0-9.,]/', '', (string) $v);
        if ($s === '') return null;

        $hasComma = str_contains($s, ',');
        $hasDot   = str_contains($s, '.');
        if ($hasComma && $hasDot) {
            // Whichever separator appears last is the decimal point; the other is thousands.
            if (strrpos($s, ',') > strrpos($s, '.')) {
                $s = str_replace(',', '#', str_replace('.', '', $s)); // dots = thousands
                $s = str_replace('#', '.', $s);                       // comma = decimal
            } else {
                $s = str_replace(',', '', $s);                        // commas = thousands
            }
        } elseif ($hasComma) {
            // comma only: decimal if 1–2 trailing digits, else thousands
            $s = preg_match('/,\d{1,2}$/', $s) ? str_replace(',', '.', $s) : str_replace(',', '', $s);
        } elseif ($hasDot) {
            // dot only: grouped thousands (562.000, 1.234.567) → strip; otherwise it's a decimal
            if (preg_match('/^\d{1,3}(\.\d{3})+$/', $s)) $s = str_replace('.', '', $s);
        }

        if (!is_numeric($s)) return null;
        $f = (float) $s;
        return $f > 0 ? $f : null;
    }

    /** Date → valid YYYY-MM-DD within a sane year range, or null. */
    private static function sanitizeDate($v): ?string {
        if (!is_string($v)) return null;
        $v = trim($v);
        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m)) return null;
        $y = (int) $m[1]; $mo = (int) $m[2]; $d = (int) $m[3];
        if ($y < 2000 || $y > ((int) date('Y') + 1)) return null;   // reject impossible years (e.g. 2126)
        if (!checkdate($mo, $d, $y)) return null;
        return $v;
    }

    /** Trim a string; empty → null. */
    private static function cleanStr($v): ?string {
        if (!is_string($v)) return null;
        $v = trim($v);
        return $v === '' ? null : $v;
    }

    // ────────────────────────── internals ──────────────────────────

    private static function err(int $code, string $msg): array {
        return [
            'ok' => false, 'errorCode' => $code, 'error' => $msg, 'data' => null,
            'timing' => ['ocr' => 0.0, 'groq' => 0.0, 'total' => 0.0],
            'ocrText' => '', 'wordCount' => 0, 'raw' => '',
        ];
    }

    /** Load backend/.env into $_ENV if the API key isn't already present (CLI use). */
    private static function loadEnv(): void {
        if (!empty($_ENV['GROQ_API_KEY'])) return;
        $envFile = __DIR__ . '/../.env';
        if (!file_exists($envFile)) return;
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
            [$k, $v] = explode('=', $line, 2);
            $_ENV[trim($k)] = trim($v);
        }
    }

    /** Convert a HEIC file to a temporary JPEG. Returns the JPEG path or null. */
    private static function convertHeic(string $imagePath): ?string {
        $tmpDir  = sys_get_temp_dir();
        $inPath  = $tmpDir . '/heic_in_'  . uniqid() . '.heic';
        $outPath = $tmpDir . '/heic_out_' . uniqid() . '.jpg';
        copy($imagePath, $inPath);

        $ok = false;
        if (PHP_OS === 'Darwin') {
            exec('/usr/bin/sips -s format jpeg ' . escapeshellarg($inPath) . ' --out ' . escapeshellarg($outPath) . ' 2>&1');
            $ok = (file_exists($outPath) && filesize($outPath) > 0);
        }
        if (!$ok) {
            exec('convert ' . escapeshellarg($inPath) . ' ' . escapeshellarg($outPath) . ' 2>&1');
            $ok = (file_exists($outPath) && filesize($outPath) > 0);
        }
        @unlink($inPath);
        return $ok ? $outPath : null;
    }

    /** Run Tesseract OCR. Returns [exitStatus, text]. */
    private static function runOcr(string $imagePath): array {
        $tesseract = '/usr/bin/tesseract';
        foreach ([
            trim(shell_exec('which tesseract 2>/dev/null') ?: ''),
            '/usr/local/bin/tesseract',    // Homebrew (Intel)
            '/opt/homebrew/bin/tesseract', // Homebrew (Apple Silicon)
            '/usr/bin/tesseract',          // Linux / system
        ] as $candidate) {
            if ($candidate && file_exists($candidate)) { $tesseract = $candidate; break; }
        }

        $libPrefix = PHP_OS === 'Darwin' ? 'DYLD_LIBRARY_PATH=/usr/local/lib ' : '';
        $cmd = $libPrefix . $tesseract . ' ' . escapeshellarg($imagePath) . ' stdout -l eng 2>/dev/null';
        exec($cmd, $lines, $status);
        return [$status, implode("\n", $lines)];
    }

    /**
     * EXIF auto-orientation only.
     *
     * Rotating a sideways/upside-down phone photo upright is the one
     * preprocessing step that strictly *helps* OCR and can never reduce text
     * fidelity. Everything else (upscaling, contrast, binarisation via GD) was
     * found to fight Tesseract 5's own internal Leptonica preprocessing and
     * lower accuracy, so it is intentionally NOT done here.
     *
     * Returns a temp PNG of the rotated image, or null when no rotation is
     * needed (the caller then OCRs the untouched original at full detail).
     */
    private static function preprocess(string $imagePath): ?string {
        if (!extension_loaded('gd') || !function_exists('exif_read_data')) return null;

        $info = @getimagesize($imagePath);
        if ($info === false || ($info['mime'] ?? '') !== 'image/jpeg') return null; // only JPEG carries EXIF orientation

        $exif = @exif_read_data($imagePath);
        $o    = $exif['Orientation'] ?? 0;
        $rot  = ($o === 3) ? 180 : (($o === 6) ? -90 : (($o === 8) ? 90 : 0));
        if ($rot === 0) return null; // already upright → leave original untouched

        $img = @imagecreatefromjpeg($imagePath);
        if (!$img) return null;
        $r = @imagerotate($img, $rot, 0);
        if ($r !== false) { imagedestroy($img); $img = $r; }

        $out = sys_get_temp_dir() . '/ocr_pre_' . uniqid() . '.png';
        $ok  = @imagepng($img, $out, 6);
        imagedestroy($img);

        return ($ok && file_exists($out) && filesize($out) > 0) ? $out : null;
    }

    /** The receipt-parsing system prompt (strict rules). */
    private static function systemPrompt(): string {
        return <<<'PROMPT'
You are a precise receipt-parsing engine. You receive raw OCR text that may contain noise, identifiers, and many irrelevant numbers. Extract structured data.

Extract these fields:
- total_amount: the FINAL grand total the customer owes. Accept these labels: Total, Grand Total, Net Total, Amount, Amount Due, Balance Due.
  IGNORE every other number, including: individual item prices, Subtotal, Discount, VAT / Tax, tips, Cash / Paid / Tendered and Change, and ALL identifiers — Merchant ID, Terminal ID, Batch, Transaction ID, Serial / S/N, phone / Tel, VAT registration number, and barcodes.
  Format: a plain number with no currency symbol and no thousands separators, using '.' only as a decimal point.
- currency: the ISO code. Map L.L, LL, ل.ل, LBP -> "LBP"; $ or USD -> "USD"; £ -> "GBP"; € -> "EUR". If none is present, null.
- date: the transaction date as YYYY-MM-DD. If unreadable, null.
- description: the merchant / store name in Title Case. Ignore addresses, phone, websites, identifiers, cashier/table numbers, and slogans. If there is no clear store name, return null.
- category: the single best fit from exactly: Food & Drinks, Groceries, Shopping, Transport, Entertainment, Health, Bills & Utilities, Travel, Education, Miscellaneous.

Output ONLY a JSON object with keys: total_amount, currency, date, description, category. No explanation, no markdown.
PROMPT;
    }

    /** Few-shot examples to anchor the format and edge-case handling. */
    private static function fewShot(): array {
        $ocr1 = <<<'OCR'
GO RESTAURANT
123 Main St, Springfield
Tel: 555-0192
Table 4
1x Burger 12.00
1x Fries 4.50
Subtotal 16.50
Tax 1.25
TOTAL $17.75
VISA ****1234
Thank you for dining with us!
08/25/2018
OCR;
        $ocr2 = <<<'OCR'
EAST REPAIR INC.
1912 Harvest Lane, New York, NY
Receipt Date: 02/11/2019
QTY  DESCRIPTION          AMOUNT
1    Brake cables          100.00
2    Pedal arms  @15.00     30.00
3    Labor 3hrs  @5.00      15.00
Subtotal                   145.00
Sales Tax 6.25%              9.06
TOTAL                     $154.06
Payment: Check
OCR;
        return [
            ['role' => 'user',      'content' => $ocr1],
            ['role' => 'assistant', 'content' => json_encode([
                'total_amount' => 17.75, 'currency' => 'USD', 'date' => '2018-08-25',
                'description' => 'Go Restaurant', 'category' => 'Food & Drinks',
            ])],
            ['role' => 'user',      'content' => $ocr2],
            ['role' => 'assistant', 'content' => json_encode([
                'total_amount' => 154.06, 'currency' => 'USD', 'date' => '2019-02-11',
                'description' => 'East Repair Inc', 'category' => 'Bills & Utilities',
            ])],
        ];
    }

    /** Call the Groq chat-completions API. Returns [curlErrno, httpCode, rawResponse]. */
    private static function callGroq(string $apiKey, string $ocrText): array {
        $messages = array_merge(
            [['role' => 'system', 'content' => self::systemPrompt()]],
            self::fewShot(),
            [['role' => 'user', 'content' => substr($ocrText, 0, 4000)]]
        );

        $payload = [
            'model'          => GROQ_MODEL,
            'messages'       => $messages,
            'temperature'    => 0.1,
            'max_tokens'     => 300,
            'response_format'=> ['type' => 'json_object'],  // guaranteed valid JSON
        ];

        // gpt-oss is a reasoning model: without capping the effort, its hidden
        // reasoning tokens can eat the tight 300-token budget and truncate the
        // JSON result. 'low' leaves room for the actual output. Guarded so a
        // non-gpt-oss GROQ_MODEL never receives an unsupported param.
        if (str_starts_with(GROQ_MODEL, 'openai/gpt-oss')) {
            $payload['reasoning_effort'] = 'low';
        }

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
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

        return [$curlError, $httpCode, $response];
    }
}
