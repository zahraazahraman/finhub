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
    // Returns currency_code per row so BLL can convert before summing
    public function getMonthlyTotals(int $userId, string $from, string $to): array {
        $stmt = $this->db->prepare(
            "SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
                    t.transaction_type,
                    SUM(t.amount) AS total,
                    c.code AS currency_code
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             LEFT JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
               AND t.transaction_type IN ('income', 'expense')
               AND t.transaction_date BETWEEN :from AND :to
             GROUP BY month, t.transaction_type, c.code
             ORDER BY month ASC"
        );
        $stmt->execute([':user_id' => $userId, ':from' => $from, ':to' => $to]);
        return $stmt->fetchAll();
    }

    // Category breakdown by type — for donut chart
    // Returns currency_code per row so BLL can convert before summing
    public function getCategoryTotals(int $userId, string $type, string $from, string $to): array {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(cat.name, 'Uncategorized') AS category_name,
                    SUM(t.amount) AS total,
                    c.code AS currency_code
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             LEFT JOIN Categories cat ON t.category_id = cat.category_id
             LEFT JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
               AND t.transaction_type = :type
               AND t.transaction_date BETWEEN :from AND :to
             GROUP BY t.category_id, category_name, c.code
             ORDER BY total DESC"
        );
        $stmt->execute([':user_id' => $userId, ':type' => $type, ':from' => $from, ':to' => $to]);
        return $stmt->fetchAll();
    }

    // Period rows per currency — BLL converts and sums
    public function getPeriodRows(int $userId, string $type, string $from, string $to): array {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(SUM(t.amount), 0) AS total,
                    c.code AS currency_code
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             LEFT JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
               AND t.transaction_type = :type
               AND t.transaction_date BETWEEN :from AND :to
             GROUP BY c.code"
        );
        $stmt->execute([':user_id' => $userId, ':type' => $type, ':from' => $from, ':to' => $to]);
        return $stmt->fetchAll();
    }

    // Last 10 transactions across all accounts — optional category filter
    public function getRecentTransactions(int $userId, string $from, string $to, ?int $categoryId): array {
        $sql = "SELECT t.transaction_id, t.amount, t.transaction_type,
                       t.description, t.transaction_date, t.source_type,
                       a.account_name, a.account_type,
                       COALESCE(c.name, 'Uncategorized') AS category_name,
                       cur.symbol AS currency_symbol, cur.code AS currency_code
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

    // Active goals — up to 3, for dashboard teaser
    public function getActiveGoals(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT g.goal_id, g.goal_name, g.goal_type,
                    g.target_amount, g.current_amount, g.deadline,
                    c.code AS currency_code, c.symbol AS currency_symbol
             FROM Goals g
             JOIN Currencies c ON g.currency_id = c.currency_id
             WHERE g.user_id = :user_id
               AND g.current_amount < g.target_amount
             ORDER BY g.deadline ASC
             LIMIT 3"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }
}