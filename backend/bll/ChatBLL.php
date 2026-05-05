<?php
require_once __DIR__ . '/../dal/ChatDAL.php';

class ChatBLL {
    private ChatDAL $dal;

    public function __construct() {
        $this->dal = new ChatDAL();
    }

    // ── GET — load or create active session ──
    public function getOrCreateSession(int $userId): array {
        $session = $this->dal->getActiveSession($userId);

        if (!$session) {
            $sessionId = $this->dal->createSession($userId);
            $messages  = [];
        } else {
            $sessionId = (int)$session['chat_session_id'];
            $messages  = $this->dal->getMessages($sessionId);
        }

        return [
            'success'    => true,
            'session_id' => $sessionId,
            'messages'   => $messages,
        ];
    }

    // ── POST — send a message, call AI, return AI response ──
    public function sendMessage(int $userId, int $sessionId, string $message): array {
        $message = trim($message);

        if (empty($message))
            return ['success' => false, 'message' => 'Message cannot be empty.'];
        if (strlen($message) > 2000)
            return ['success' => false, 'message' => 'Message is too long (max 2000 characters).'];

        // Verify the session is active and belongs to this user
        $session = $this->dal->getActiveSession($userId);
        if (!$session || (int)$session['chat_session_id'] !== $sessionId)
            return ['success' => false, 'message' => 'Invalid or expired session.'];

        // Persist user message
        $this->dal->addMessage($sessionId, 'user', $message);

        // Fetch the full history (includes the message we just saved)
        $history = $this->dal->getMessages($sessionId);

        // Read user preferences from session — both have safe fallbacks for
        // sessions created before the migration ran.
        $shareData = (int)($_SESSION['user']['ai_data_sharing'] ?? 1);
        $aiTone    = $_SESSION['user']['ai_tone'] ?? 'professional';

        // Build Groq messages array with (conditional) financial context as system prompt
        $groqMessages = $this->buildGroqMessages($userId, $history, $shareData, $aiTone);

        // Call Groq
        $aiText = $this->callGroq($groqMessages);
        if ($aiText === null)
            return ['success' => false, 'message' => 'AI service is unavailable. Please try again.'];

        // Persist AI response
        $messageId = $this->dal->addMessage($sessionId, 'ai', $aiText);

        return [
            'success' => true,
            'message' => [
                'message_id'   => $messageId,
                'sender_type'  => 'ai',
                'message_text' => $aiText,
                'sent_at'      => date('Y-m-d H:i:s'),
            ],
        ];
    }

    // ── DELETE — end current session and create a fresh one ──
    public function startNewSession(int $userId): array {
        $current = $this->dal->getActiveSession($userId);
        if ($current) {
            $this->dal->endSession((int)$current['chat_session_id']);
        }

        $sessionId = $this->dal->createSession($userId);
        return [
            'success'    => true,
            'session_id' => $sessionId,
            'messages'   => [],
        ];
    }

    // ── Build Groq messages array ──
    // Passes shareData and aiTone down to the system prompt builder.
    private function buildGroqMessages(int $userId, array $history, int $shareData, string $aiTone): array {
        $systemPrompt = $this->buildSystemPrompt($userId, $shareData, $aiTone);

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($history as $msg) {
            $role       = ($msg['sender_type'] === 'ai') ? 'assistant' : 'user';
            $messages[] = ['role' => $role, 'content' => $msg['message_text']];
        }

        return $messages;
    }

    // ── Build system prompt ──
    // If $shareData === 1, fetch and inject the user's live financial snapshot.
    // If $shareData === 0, provide a general advisor role with no personal data.
    // $aiTone controls the language style appended to the guidelines.
    private function buildSystemPrompt(int $userId, int $shareData, string $aiTone): string {
        $lines = [];

        $lines[] = "You are FinHub's AI Financial Consultant — a knowledgeable, friendly, and practical financial advisor.";

        if ($shareData === 1) {
            $context = $this->dal->getUserFinancialContext($userId);

            $lines[] = "You have access to this user's live financial data directly from their FinHub account.";
            $lines[] = "Use it to provide personalized, specific, and actionable advice.\n";
            $lines[] = "=== USER'S FINANCIAL SNAPSHOT ===\n";

            // Accounts
            if (!empty($context['accounts'])) {
                $lines[] = "Accounts:";
                foreach ($context['accounts'] as $acc) {
                    $balance = number_format((float)$acc['balance'], 2);
                    $lines[] = "  - {$acc['account_name']}: {$acc['currency_symbol']}{$balance} {$acc['currency_code']}";
                }
                $currencies = array_unique(array_column($context['accounts'], 'currency_code'));
                if (count($currencies) > 1) {
                    $lines[] = "  (User has accounts in multiple currencies: " . implode(', ', $currencies) . ")";
                }
            } else {
                $lines[] = "Accounts: None created yet.";
            }

            // Monthly summary
            $monthly = $context['monthly'];
            $lines[] = "\nThis month's activity:";
            $lines[] = "  - Income:   " . number_format((float)$monthly['month_income'], 2);
            $lines[] = "  - Expenses: " . number_format((float)$monthly['month_expenses'], 2);
            $net     = (float)$monthly['month_income'] - (float)$monthly['month_expenses'];
            $sign    = $net >= 0 ? '+' : '';
            $lines[] = "  - Net:      {$sign}" . number_format($net, 2);

            // Goals
            if (!empty($context['goals'])) {
                $lines[] = "\nFinancial Goals:";
                foreach ($context['goals'] as $g) {
                    $pct     = (float)$g['target_amount'] > 0
                        ? round(((float)$g['current_amount'] / (float)$g['target_amount']) * 100, 1)
                        : 0;
                    $type    = ucfirst(str_replace('_', ' ', $g['goal_type']));
                    $current = number_format((float)$g['current_amount'], 2);
                    $target  = number_format((float)$g['target_amount'], 2);
                    $lines[] = "  - {$g['goal_name']} ({$type}): {$current} / {$target} {$g['currency_code']} ({$pct}% complete)";
                }
            } else {
                $lines[] = "\nFinancial Goals: None yet.";
            }

            // Investments
            if (!empty($context['investments'])) {
                $lines[] = "\nInvestments:";
                foreach ($context['investments'] as $inv) {
                    $type    = ucfirst(str_replace('_', ' ', $inv['investment_type']));
                    $cur     = ($inv['current_price'] !== null && (float)$inv['current_price'] > 0)
                        ? (float)$inv['current_price']
                        : (float)$inv['purchase_price'];
                    $pnl     = round(($cur - (float)$inv['purchase_price']) * (float)$inv['quantity'], 2);
                    $pnlSign = $pnl >= 0 ? '+' : '';
                    $lines[] = "  - {$inv['investment_name']} ({$type}): qty {$inv['quantity']} @ buy {$inv['purchase_price']} {$inv['currency_code']}, now {$cur} {$inv['currency_code']}, P/L: {$pnlSign}{$pnl}";
                }
            } else {
                $lines[] = "\nInvestments: None yet.";
            }

        } else {
            // User opted out of data sharing — advise generally, never reference personal numbers.
            $lines[] = "The user has chosen not to share their personal financial data with you.";
            $lines[] = "Provide thoughtful, general financial guidance without referencing any personal figures.";
            $lines[] = "You may ask the user to share details themselves in the conversation if it would help.";
        }

        $lines[] = "\n=== GUIDELINES ===";
        $lines[] = "- Be concise, clear, and focused.";
        $lines[] = "- Never guarantee returns or make definitive market predictions.";
        $lines[] = "- If the user asks about topics unrelated to personal finance, politely redirect.";
        $lines[] = "- Respond in the same language the user writes in.";

        // Tone modifier — appended last so it overrides any style implied above.
        if ($aiTone === 'simple') {
            $lines[] = "- IMPORTANT — LANGUAGE STYLE: This user is a complete beginner in personal finance.";
            $lines[] = "  Write every response in simple, everyday language — as if explaining to a friend with no financial background.";
            $lines[] = "  Avoid all financial jargon. If you must use a financial term (e.g. ROI, diversification, portfolio, asset), explain it immediately in plain words in parentheses.";
            $lines[] = "  Use short sentences. Be warm, patient, and encouraging. Never make the user feel overwhelmed.";
        }

        return implode("\n", $lines);
    }

    // ── Call Groq API ──
    private function callGroq(array $messages): ?string {
        $apiKey = $_ENV['GROQ_API_KEY'] ?? '';
        if (empty($apiKey)) return null;

        $payload = json_encode([
            'model'       => 'llama-3.3-70b-versatile',
            'temperature' => 0.7,
            'max_tokens'  => 1000,
            'messages'    => $messages,
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

        if (!$response || $httpCode !== 200) return null;

        $data = json_decode($response, true);
        $text = trim($data['choices'][0]['message']['content'] ?? '');
        return $text !== '' ? $text : null;
    }
}