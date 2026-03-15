<?php
require_once __DIR__ . '/../config/database.php';

class AdminDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare(
            "SELECT admin_id, email, password_hash 
             FROM Admins 
             WHERE email = :email 
             LIMIT 1"
        );
        $stmt->execute([':email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }
}