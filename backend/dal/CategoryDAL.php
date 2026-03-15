<?php
require_once __DIR__ . '/../config/database.php';

class CategoryDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT c.category_id, c.name, c.type, c.user_id,
                    u.first_name, u.last_name
             FROM Categories c
             LEFT JOIN Users u ON c.user_id = u.user_id
             ORDER BY c.type, c.name ASC"
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): bool {
        $stmt = $this->db->prepare(
            "INSERT INTO Categories (name, type, user_id)
             VALUES (:name, :type, :user_id)"
        );
        return $stmt->execute([
            ':name'    => $data['name'],
            ':type'    => $data['type'],
            ':user_id' => $data['user_id'] ?? null,
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM Categories WHERE category_id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }
}