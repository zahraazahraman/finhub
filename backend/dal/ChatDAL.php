<?php
require_once __DIR__ . '/../config/database.php';

class ChatDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // ── Sessions ──

    // Active session = ended_at is NULL (never ended)
    public function getActiveSession(int $userId): ?array {
        $stmt = $this->db->prepare(
            "SELECT *
             FROM ChatSessions
             WHERE user_id = :user_id
               AND ended_at IS NULL
             ORDER BY started_at DESC
             LIMIT 1"
        );
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function createSession(int $userId): int {
        $stmt = $this->db->prepare(
            "INSERT INTO ChatSessions (user_id) VALUES (:user_id)"
        );
        $stmt->execute([':user_id' => $userId]);
        return (int)$this->db->lastInsertId();
    }

    public function endSession(int $sessionId): void {
        $stmt = $this->db->prepare(
            "UPDATE ChatSessions SET ended_at = NOW() WHERE chat_session_id = :id"
        );
        $stmt->execute([':id' => $sessionId]);
    }

    // ── Messages ──

    public function getMessages(int $sessionId): array {
        $stmt = $this->db->prepare(
            "SELECT message_id, sender_type, message_text, sent_at
             FROM ChatMessages
             WHERE chat_session_id = :session_id
             ORDER BY sent_at ASC"
        );
        $stmt->execute([':session_id' => $sessionId]);
        return $stmt->fetchAll();
    }

    public function addMessage(int $sessionId, string $senderType, string $text): int {
        $stmt = $this->db->prepare(
            "INSERT INTO ChatMessages (chat_session_id, sender_type, message_text)
             VALUES (:session_id, :sender_type, :message_text)"
        );
        $stmt->execute([
            ':session_id'   => $sessionId,
            ':sender_type'  => $senderType,
            ':message_text' => $text,
        ]);
        return (int)$this->db->lastInsertId();
    }

    // ── Financial context for AI system prompt ──

    public function getUserFinancialContext(int $userId): array {
        // Accounts
        $stmt = $this->db->prepare(
            "SELECT a.account_name, a.balance, c.code AS currency_code, c.symbol AS currency_symbol
             FROM Accounts a
             JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
             ORDER BY a.balance DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        $accounts = $stmt->fetchAll();

        // This month's totals (raw sums — may be mixed currencies, noted in system prompt)
        $stmt = $this->db->prepare(
            "SELECT
               COALESCE(SUM(CASE WHEN t.transaction_type = 'income'  THEN t.amount ELSE 0 END), 0) AS month_income,
               COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS month_expenses
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             WHERE a.user_id = :user_id
               AND YEAR(t.transaction_date)  = YEAR(CURDATE())
               AND MONTH(t.transaction_date) = MONTH(CURDATE())"
        );
        $stmt->execute([':user_id' => $userId]);
        $monthly = $stmt->fetch();

        // Goals
        $stmt = $this->db->prepare(
            "SELECT g.goal_name, g.goal_type, g.target_amount, g.current_amount, c.code AS currency_code
             FROM Goals g
             JOIN Currencies c ON g.currency_id = c.currency_id
             WHERE g.user_id = :user_id
             ORDER BY g.created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        $goals = $stmt->fetchAll();

        // Investments
        $stmt = $this->db->prepare(
            "SELECT i.investment_name, i.investment_type, i.quantity,
                    i.purchase_price, i.current_price, c.code AS currency_code
             FROM Investments i
             JOIN Currencies c ON i.currency_id = c.currency_id
             WHERE i.user_id = :user_id
             ORDER BY i.created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        $investments = $stmt->fetchAll();

        return [
            'accounts'    => $accounts,
            'monthly'     => $monthly,
            'goals'       => $goals,
            'investments' => $investments,
        ];
    }
}