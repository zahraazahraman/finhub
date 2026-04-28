<?php
require_once __DIR__ . '/../config/database.php';

class InvestmentDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT i.*, c.code AS currency_code, c.symbol AS currency_symbol
             FROM Investments i
             JOIN Currencies c ON i.currency_id = c.currency_id
             WHERE i.user_id = :user_id
             ORDER BY i.created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getById(int $investmentId): ?array {
        $stmt = $this->db->prepare(
            "SELECT i.*, c.code AS currency_code, c.symbol AS currency_symbol
             FROM Investments i
             JOIN Currencies c ON i.currency_id = c.currency_id
             WHERE i.investment_id = :investment_id
             LIMIT 1"
        );
        $stmt->execute([':investment_id' => $investmentId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(
        int     $userId,
        string  $name,
        ?string $symbol,
        string  $type,
        float   $quantity,
        float   $purchasePrice,
        ?float  $currentPrice,
        int     $currencyId,
        string  $purchaseDate,
        ?string $notes
    ): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Investments
                (user_id, investment_name, symbol, investment_type, quantity,
                 purchase_price, current_price, currency_id, purchase_date, notes)
             VALUES
                (:user_id, :name, :symbol, :type, :quantity,
                 :purchase_price, :current_price, :currency_id, :purchase_date, :notes)"
        );
        $stmt->execute([
            ':user_id'        => $userId,
            ':name'           => $name,
            ':symbol'         => $symbol,
            ':type'           => $type,
            ':quantity'       => $quantity,
            ':purchase_price' => $purchasePrice,
            ':current_price'  => $currentPrice,
            ':currency_id'    => $currencyId,
            ':purchase_date'  => $purchaseDate,
            ':notes'          => $notes,
        ]);
        return (int)$this->db->lastInsertId();
    }

    // Updates current_price for a single investment (used by both auto and manual)
    public function updateCurrentPrice(int $investmentId, float $price): void {
        $stmt = $this->db->prepare(
            "UPDATE Investments SET current_price = :price WHERE investment_id = :id"
        );
        $stmt->execute([':price' => $price, ':id' => $investmentId]);
    }

    public function delete(int $investmentId): void {
        $stmt = $this->db->prepare(
            "DELETE FROM Investments WHERE investment_id = :id"
        );
        $stmt->execute([':id' => $investmentId]);
    }
}