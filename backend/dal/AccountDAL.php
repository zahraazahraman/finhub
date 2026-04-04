<?php
require_once __DIR__ . '/../config/database.php';

class AccountDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT a.*, c.code AS currency_code, c.symbol AS currency_symbol
             FROM Accounts a
             LEFT JOIN Currencies c ON a.currency_id = c.currency_id
             WHERE a.user_id = :user_id
             ORDER BY a.created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getById(int $accountId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Accounts WHERE account_id = :account_id LIMIT 1"
        );
        $stmt->execute([':account_id' => $accountId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(int $userId, string $name, string $type, int $currencyId): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Accounts (user_id, account_name, account_type, currency_id, balance)
             VALUES (:user_id, :name, :type, :currency_id, 0.00)"
        );
        $stmt->execute([
            ':user_id'     => $userId,
            ':name'        => $name,
            ':type'        => $type,
            ':currency_id' => $currencyId,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function delete(int $accountId): void {
        $stmt = $this->db->prepare(
            "DELETE FROM Accounts WHERE account_id = :account_id"
        );
        $stmt->execute([':account_id' => $accountId]);
    }

    public function updateBalance(int $accountId, float $delta): void {
        $stmt = $this->db->prepare(
            "UPDATE Accounts SET balance = balance + :delta WHERE account_id = :account_id"
        );
        $stmt->execute([':delta' => $delta, ':account_id' => $accountId]);
    }
}
