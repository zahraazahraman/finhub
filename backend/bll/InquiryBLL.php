<?php
require_once __DIR__ . '/../dal/InquiryDAL.php';
require_once __DIR__ . '/../dal/UserConsultantDAL.php';
require_once __DIR__ . '/../dal/MyNotificationDAL.php';
require_once __DIR__ . '/../dal/AccountDAL.php';
require_once __DIR__ . '/../dal/GoalDAL.php';
require_once __DIR__ . '/../dal/InvestmentDAL.php';

class InquiryBLL {
    private InquiryDAL          $dal;
    private UserConsultantDAL   $consultantDal;
    private MyNotificationDAL   $notifDal;

    public function __construct() {
        $this->dal           = new InquiryDAL();
        $this->consultantDal = new UserConsultantDAL();
        $this->notifDal      = new MyNotificationDAL();
    }

    // ── Generate consultation brief via Groq ──
    // Pulls the user's accounts, goals, investments, and top spending from the DB,
    // sends a structured prompt to Groq, and returns the generated brief text.
    // Falls back to a plain-text stub if Groq is unavailable.
    public function generateBrief(int $userId, int $consultantId, string $userNote, bool $includeData = true): array {
        $consultant = $this->consultantDal->getById($consultantId);
        if (!$consultant) {
            return ['success' => false, 'message' => 'Consultant not found.'];
        }

        $firstName      = $_SESSION['user']['first_name'] ?? 'there';
        $spec           = $consultant['specialization'] ?? 'financial planning';
        $consultantName = "{$consultant['first_name']} {$consultant['last_name']}";

        // Build context block — financial snapshot only when the user consented
        $ctx  = "Consultant: {$consultantName}, specializing in {$spec}.\n";
        $ctx .= "User first name: {$firstName}\n\n";

        if ($includeData) {
            $accounts    = (new AccountDAL())->getByUser($userId);
            $goals       = (new GoalDAL())->getByUser($userId);
            $investments = (new InvestmentDAL())->getByUser($userId);

            // Top 3 expense categories this month across all of the user's accounts
            $db   = Database::getInstance();
            $stmt = $db->prepare(
                "SELECT c.name AS category, SUM(t.amount) AS total
                 FROM Transactions t
                 JOIN Accounts a   ON a.account_id   = t.account_id
                 JOIN Categories c ON c.category_id  = t.category_id
                 WHERE a.user_id                  = :uid
                   AND t.transaction_type         = 'expense'
                   AND MONTH(t.transaction_date)  = MONTH(NOW())
                   AND YEAR(t.transaction_date)   = YEAR(NOW())
                 GROUP BY c.category_id
                 ORDER BY total DESC
                 LIMIT 3"
            );
            $stmt->execute([':uid' => $userId]);
            $topSpending = $stmt->fetchAll();

            if (!empty($accounts)) {
                $ctx .= "Accounts:\n";
                foreach ($accounts as $a) {
                    $ctx .= "  - {$a['account_name']}: {$a['currency_symbol']}"
                          . number_format((float)$a['balance'], 2) . " {$a['currency_code']}\n";
                }
            }

            if (!empty($goals)) {
                $ctx .= "\nFinancial Goals:\n";
                foreach ($goals as $g) {
                    $pct  = (float)$g['target_amount'] > 0
                        ? round(((float)$g['current_amount'] / (float)$g['target_amount']) * 100, 1)
                        : 0;
                    $ctx .= "  - {$g['goal_name']}: "
                          . number_format((float)$g['current_amount'], 2) . " / "
                          . number_format((float)$g['target_amount'], 2)
                          . " {$g['currency_code']} ({$pct}% done)\n";
                }
            }

            if (!empty($investments)) {
                $ctx .= "\nInvestments:\n";
                foreach ($investments as $inv) {
                    $type  = ucfirst(str_replace('_', ' ', $inv['investment_type']));
                    $ctx .= "  - {$inv['investment_name']} ({$type}): "
                          . "{$inv['quantity']} units @ {$inv['purchase_price']} {$inv['currency_code']}\n";
                }
            }

            if (!empty($topSpending)) {
                $ctx .= "\nTop spending categories this month:\n";
                foreach ($topSpending as $s) {
                    $ctx .= "  - {$s['category']}: " . number_format((float)$s['total'], 2) . "\n";
                }
            }
        }

        if (trim($userNote) !== '') {
            $ctx .= "\nUser's own description of their situation:\n  \"" . trim($userNote) . "\"\n";
        }

        $brief = $this->callGroqBrief($ctx, $firstName, $consultantName, $spec);

        // Graceful fallback when Groq is unavailable
        if ($brief === null) {
            $brief = "Hi, I'm {$firstName}. I'm looking to connect with {$consultantName} for guidance on {$spec}.";
            if (trim($userNote) !== '') {
                $brief .= ' My main concern is: ' . trim($userNote) . '.';
            }
        }

        return ['success' => true, 'brief_text' => $brief];
    }

    private function callGroqBrief(string $context, string $userName, string $consultantName, string $spec): ?string {
        $apiKey = $_ENV['GROQ_API_KEY'] ?? '';
        if (empty($apiKey)) return null;

        $system = "You are a professional financial consultation intake assistant. "
                . "Write a concise, first-person introduction brief (3-5 sentences) from a user "
                . "reaching out to a financial consultant. Be professional yet warm. "
                . "Clearly mention the user's key financial situation and their primary goal. "
                . "Do not use greetings like 'Dear' or closing sign-offs.";

        $prompt = "Using the following data, write the introduction brief:\n\n{$context}\n"
                . "Write in first person as {$userName}. Keep it to 3-5 sentences.";

        $payload = json_encode([
            'model'       => 'llama-3.3-70b-versatile',
            'temperature' => 0.6,
            'max_tokens'  => 300,
            'messages'    => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user',   'content' => $prompt],
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
            CURLOPT_TIMEOUT => 20,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response || $httpCode !== 200) return null;

        $data = json_decode($response, true);
        $text = trim($data['choices'][0]['message']['content'] ?? '');
        return $text !== '' ? $text : null;
    }

    // ── Submit an inquiry ──
    // Checks for a duplicate pending inquiry before inserting.
    // Fires an in-app notification on success.
    public function submitInquiry(int $userId, int $consultantId, string $brief, string $note, string $situationTag): array {
        if ($consultantId <= 0) {
            return ['success' => false, 'message' => 'Invalid consultant.'];
        }

        if ($this->dal->checkDuplicate($userId, $consultantId)) {
            return ['success' => false, 'message' => 'You already have a pending inquiry with this consultant.'];
        }

        $inquiryId = $this->dal->insert($userId, $consultantId, $brief, $note, $situationTag);

        $consultant     = $this->consultantDal->getById($consultantId);
        $consultantName = $consultant
            ? "{$consultant['first_name']} {$consultant['last_name']}"
            : 'the consultant';

        $this->notifDal->create(
            $userId,
            'consultant_inquiry',
            'Inquiry Sent',
            "Your inquiry to {$consultantName} has been submitted."
        );

        return ['success' => true, 'inquiry_id' => $inquiryId];
    }

    public function getUserInquiries(int $userId): array {
        $inquiries = $this->dal->getByUser($userId);
        return ['success' => true, 'inquiries' => $inquiries];
    }

    // ── Check eligibility for sending inquiry and leaving review ──
    // already_sent: a pending inquiry exists → block new submission
    // can_review:   a responded/closed inquiry without a review exists
    // inquiry_id:   the inquiry_id eligible for review (null if none)
    public function checkEligibility(int $userId, int $consultantId): array {
        $alreadySent  = $this->dal->checkDuplicate($userId, $consultantId);
        $reviewableId = $this->dal->getReviewableInquiry($userId, $consultantId);

        return [
            'success'      => true,
            'already_sent' => $alreadySent,
            'can_review'   => $reviewableId !== null,
            'inquiry_id'   => $reviewableId,
        ];
    }
}
