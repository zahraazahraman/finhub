<?php
require_once __DIR__ . '/../dal/UserConsultantDAL.php';

class UserConsultantBLL {
    private UserConsultantDAL $dal;

    public function __construct() {
        $this->dal = new UserConsultantDAL();
    }

    public function getAll(?string $specialization): array {
        $spec = ($specialization && strtolower($specialization) !== 'all')
            ? trim($specialization)
            : null;

        $consultants = $this->dal->getAll($spec);
        return ['success' => true, 'consultants' => $consultants];
    }

    public function getSpecializations(): array {
        $specializations = $this->dal->getSpecializations();
        return ['success' => true, 'specializations' => $specializations];
    }

    public function getOne(int $id): array {
        $consultant = $this->dal->getById($id);
        if (!$consultant) {
            return ['success' => false, 'message' => 'Consultant not found.'];
        }
        return ['success' => true, 'consultant' => $consultant];
    }

    public function matchByNeed(string $needText): array {
        $needText = trim($needText);
        $all      = $this->dal->getAllSorted();

        if (empty($all)) {
            return ['success' => true, 'consultants' => [], 'matched_spec' => null];
        }

        // Build a compact consultant catalogue for the prompt
        $catalogue = '';
        foreach ($all as $c) {
            $bio  = !empty($c['bio']) ? ' — ' . mb_substr($c['bio'], 0, 80) : '';
            $catalogue .= "ID {$c['consultant_id']}: {$c['specialization']}{$bio}\n";
        }

        $matchedIds = $this->callGroqMatch($needText, $catalogue);

        // Groq unavailable or returned nothing useful — fall back to keyword map
        if ($matchedIds === null) {
            $matchedIds = $this->keywordFallback($needText, $all);
        }

        if (!empty($matchedIds)) {
            $idSet   = array_flip($matchedIds);
            $matched = array_filter($all, fn($c) => isset($idSet[(int)$c['consultant_id']]));
            return ['success' => true, 'consultants' => array_values($matched), 'matched_spec' => null];
        }

        return ['success' => true, 'consultants' => $all, 'matched_spec' => null];
    }

    private function callGroqMatch(string $situation, string $catalogue): ?array {
        $apiKey = $_ENV['GROQ_API_KEY'] ?? '';
        if (empty($apiKey)) return null;

        $system = "You are a financial consultant matching assistant. "
                . "Given a user's situation and a list of consultants, return ONLY a JSON array "
                . "of the integer IDs of the consultants who are the best match. "
                . "Return at most 5 IDs. Return an empty array [] if none are relevant. "
                . "Return ONLY the JSON array — no explanation, no markdown.";

        $prompt = "User's situation: \"{$situation}\"\n\nAvailable consultants:\n{$catalogue}\n"
                . "Return the matching consultant IDs as a JSON array of integers.";

        $payload = json_encode([
            'model'       => GROQ_MODEL,
            'temperature' => 0.2,
            'max_tokens'  => 80,
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
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response || $httpCode !== 200) return null;

        $data = json_decode($response, true);
        $text = trim($data['choices'][0]['message']['content'] ?? '');
        if ($text === '') return null;

        // Strip any accidental markdown fences
        $text = preg_replace('/^```[^\n]*\n?|```$/m', '', $text);

        $ids = json_decode(trim($text), true);
        if (!is_array($ids)) return null;

        return array_values(array_filter(array_map('intval', $ids)));
    }

    // Simple keyword fallback used when Groq is unavailable.
    private function keywordFallback(string $needText, array $all): array {
        $text = strtolower($needText);
        $specMap = [
            'debt'       => 'Debt Management',
            'loan'       => 'Debt Management',
            'credit'     => 'Debt Management',
            'invest'     => 'Investment',
            'stock'      => 'Investment',
            'crypto'     => 'Investment',
            'portfolio'  => 'Investment',
            'save'       => 'Savings',
            'saving'     => 'Savings',
            'budget'     => 'Savings',
            'tax'        => 'Tax Planning',
            'retire'     => 'Retirement',
            'pension'    => 'Retirement',
            'insurance'  => 'Insurance',
            'estate'     => 'Estate Planning',
            'business'   => 'Business Finance',
        ];

        $targetSpec = null;
        foreach ($specMap as $keyword => $spec) {
            if (str_contains($text, $keyword)) { $targetSpec = $spec; break; }
        }

        if (!$targetSpec) return [];

        return array_column(
            array_filter($all, fn($c) => stripos($c['specialization'], $targetSpec) !== false),
            'consultant_id'
        );
    }

    // Used by Phase 5 handoff detection in ChatBLL.
    public function getTopBySpecialization(string $specialization, int $limit = 2): array {
        $consultants = $this->dal->getBySpecialization($specialization);
        return array_slice($consultants, 0, $limit);
    }
}
