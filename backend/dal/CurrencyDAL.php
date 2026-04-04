<?php
require_once __DIR__ . '/../config/database.php';

class CurrencyDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM Currencies ORDER BY code ASC");
        return $stmt->fetchAll();
    }
}
