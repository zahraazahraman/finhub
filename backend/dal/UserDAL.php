<?php
require_once __DIR__ . '/../config/database.php';

class UserDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT user_id, first_name, last_name, email, 
                    phone_number, status, email_verified, created_at 
             FROM Users 
             ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function updateStatus(int $userId, string $status): bool {
        $stmt = $this->db->prepare(
            "UPDATE Users SET status = :status WHERE user_id = :user_id"
        );
        return $stmt->execute([':status' => $status, ':user_id' => $userId]);
    }

    public function delete(int $userId): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM Users WHERE user_id = :user_id"
        );
        return $stmt->execute([':user_id' => $userId]);
    }
}