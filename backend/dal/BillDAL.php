<?php
require_once __DIR__ . '/../config/database.php';

class BillDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT b.*,
                    c.code AS currency_code, c.symbol AS currency_symbol,
                    cat.name AS category_name
             FROM Bills b
             JOIN Currencies c ON b.currency_id = c.currency_id
             LEFT JOIN Categories cat ON b.category_id = cat.category_id
             WHERE b.user_id = :user_id
             ORDER BY b.is_paid ASC, b.due_date ASC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getById(int $billId): ?array {
        $stmt = $this->db->prepare(
            "SELECT b.*,
                    c.code AS currency_code, c.symbol AS currency_symbol,
                    cat.name AS category_name
             FROM Bills b
             JOIN Currencies c ON b.currency_id = c.currency_id
             LEFT JOIN Categories cat ON b.category_id = cat.category_id
             WHERE b.bill_id = :bill_id
             LIMIT 1"
        );
        $stmt->execute([':bill_id' => $billId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(
        int $userId,
        string $name,
        float $amount,
        int $currencyId,
        string $dueDate,
        string $recurrenceType,
        ?int $categoryId
    ): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Bills (user_id, name, amount, currency_id, due_date, recurrence_type, category_id, is_paid)
             VALUES (:user_id, :name, :amount, :currency_id, :due_date, :recurrence_type, :category_id, 0)"
        );
        $stmt->execute([
            ':user_id'         => $userId,
            ':name'            => $name,
            ':amount'          => $amount,
            ':currency_id'     => $currencyId,
            ':due_date'        => $dueDate,
            ':recurrence_type' => $recurrenceType,
            ':category_id'     => $categoryId,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(
        int $userId,
        int $billId,
        string $name,
        float $amount,
        int $currencyId,
        string $dueDate,
        string $recurrenceType,
        ?int $categoryId
    ): bool {
        $stmt = $this->db->prepare(
            "UPDATE Bills
             SET name = :name,
                 amount = :amount,
                 currency_id = :currency_id,
                 due_date = :due_date,
                 recurrence_type = :recurrence_type,
                 category_id = :category_id
             WHERE bill_id = :bill_id AND user_id = :user_id"
        );
        return $stmt->execute([
            ':name'            => $name,
            ':amount'          => $amount,
            ':currency_id'     => $currencyId,
            ':due_date'        => $dueDate,
            ':recurrence_type' => $recurrenceType,
            ':category_id'     => $categoryId,
            ':bill_id'         => $billId,
            ':user_id'         => $userId,
        ]);
    }

    public function markAsPaid(int $billId): void {
        $stmt = $this->db->prepare("UPDATE Bills SET is_paid = 1 WHERE bill_id = :bill_id");
        $stmt->execute([':bill_id' => $billId]);
    }

    public function markAsUnpaid(int $billId): void {
        $stmt = $this->db->prepare("UPDATE Bills SET is_paid = 0 WHERE bill_id = :bill_id");
        $stmt->execute([':bill_id' => $billId]);
    }

    public function delete(int $billId): void {
        $stmt = $this->db->prepare("DELETE FROM Bills WHERE bill_id = :bill_id");
        $stmt->execute([':bill_id' => $billId]);
    }
}