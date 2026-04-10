<?php
require_once __DIR__ . '/../config/database.php';

class DashboardUserDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // All accounts with currency — for balance cards
    public function getAccounts(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT a.account_id, a.account_name, a.account_type,
                    a.balance, c.code AS currency_code, c.symbol AS currency_symbol
             FROM Accounts a
             LEFT JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
             ORDER BY a.created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    // Monthly income + expense totals — for bar chart (excludes transfers)
    public function getMonthlyTotals(int $userId, string $from, string $to): array {
        $stmt = $this->db->prepare(
            "SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
                    t.transaction_type,
                    SUM(t.amount) AS total
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             WHERE a.user_id = :user_id
               AND t.transaction_type IN ('income', 'expense')
               AND t.transaction_date BETWEEN :from AND :to
             GROUP BY month, t.transaction_type
             ORDER BY month ASC"
        );
        $stmt->execute([':user_id' => $userId, ':from' => $from, ':to' => $to]);
        return $stmt->fetchAll();
    }

    // Category breakdown by type — for donut chart
    public function getCategoryTotals(int $userId, string $type, string $from, string $to): array {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(c.name, 'Uncategorized') AS category_name,
                    SUM(t.amount) AS total
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             LEFT JOIN Categories c ON t.category_id = c.category_id
             WHERE a.user_id = :user_id
               AND t.transaction_type = :type
               AND t.transaction_date BETWEEN :from AND :to
             GROUP BY t.category_id, category_name
             ORDER BY total DESC"
        );
        $stmt->execute([':user_id' => $userId, ':type' => $type, ':from' => $from, ':to' => $to]);
        return $stmt->fetchAll();
    }

    // Period total for a single type — for stat cards
    public function getPeriodTotal(int $userId, string $type, string $from, string $to): float {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(SUM(t.amount), 0)
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             WHERE a.user_id = :user_id
               AND t.transaction_type = :type
               AND t.transaction_date BETWEEN :from AND :to"
        );
        $stmt->execute([':user_id' => $userId, ':type' => $type, ':from' => $from, ':to' => $to]);
        return (float)$stmt->fetchColumn();
    }

    // Last 10 transactions across all accounts — optional category filter
    public function getRecentTransactions(int $userId, string $from, string $to, ?int $categoryId): array {
        $sql = "SELECT t.transaction_id, t.amount, t.transaction_type,
                       t.description, t.transaction_date, t.source_type,
                       a.account_name, a.account_type,
                       COALESCE(c.name, 'Uncategorized') AS category_name,
                       cur.symbol AS currency_symbol
                FROM Transactions t
                JOIN Accounts a ON t.account_id = a.account_id
                LEFT JOIN Categories c ON t.category_id = c.category_id
                LEFT JOIN Currencies cur ON a.currency_id = cur.currency_id
                WHERE a.user_id = :user_id
                  AND t.transaction_date BETWEEN :from AND :to";

        $params = [':user_id' => $userId, ':from' => $from, ':to' => $to];

        if ($categoryId !== null) {
            $sql .= " AND t.category_id = :category_id";
            $params[':category_id'] = $categoryId;
        }

        $sql .= " ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT 10";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Active goals (not 100% complete) — up to 3, for dashboard teaser
    public function getActiveGoals(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT goal_id, goal_name, goal_type,
                    target_amount, current_amount, deadline
             FROM Goals
             WHERE user_id = :user_id
               AND current_amount < target_amount
             ORDER BY deadline ASC
             LIMIT 3"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }
}