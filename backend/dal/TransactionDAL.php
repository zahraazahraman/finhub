<?php
require_once __DIR__ . '/../config/database.php';

class TransactionDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByAccount(int $accountId): array {
        $stmt = $this->db->prepare(
            "SELECT t.*, c.name AS category_name
             FROM Transactions t
             LEFT JOIN Categories c ON t.category_id = c.category_id
             WHERE t.account_id = :account_id
             ORDER BY t.transaction_date DESC, t.created_at DESC"
        );
        $stmt->execute([':account_id' => $accountId]);
        return $stmt->fetchAll();
    }

    public function getById(int $transactionId): ?array {
        $stmt = $this->db->prepare(
            "SELECT t.*, a.user_id
             FROM Transactions t
             JOIN Accounts a ON t.account_id = a.account_id
             WHERE t.transaction_id = :transaction_id
             LIMIT 1"
        );
        $stmt->execute([':transaction_id' => $transactionId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(int $accountId, ?int $categoryId, float $amount, string $type, string $description, string $date): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Transactions 
             (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
             VALUES (:account_id, :category_id, :amount, :type, 'manual', :description, :date)"
        );
        $stmt->execute([
            ':account_id'  => $accountId,
            ':category_id' => $categoryId,
            ':amount'      => $amount,
            ':type'        => $type,
            ':description' => $description,
            ':date'        => $date,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function delete(int $transactionId): void {
        $stmt = $this->db->prepare(
            "DELETE FROM Transactions WHERE transaction_id = :transaction_id"
        );
        $stmt->execute([':transaction_id' => $transactionId]);
    }
}
