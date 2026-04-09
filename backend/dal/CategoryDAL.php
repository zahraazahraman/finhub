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

    public function nameTypeExists(string $name, string $type): bool {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM Categories 
            WHERE LOWER(name) = LOWER(:name) AND type = :type"
        );
        $stmt->execute([':name' => $name, ':type' => $type]);
        return $stmt->fetchColumn() > 0;
    }

    public function findByNameAndType(string $name, string $type, int $userId): ?int {
        $stmt = $this->db->prepare(
            "SELECT category_id FROM Categories
            WHERE LOWER(name) = LOWER(:name) AND type = :type
            AND (user_id IS NULL OR user_id = :user_id)
            LIMIT 1"
        );
        $stmt->execute([':name' => $name, ':type' => $type, ':user_id' => $userId]);
        $result = $stmt->fetchColumn();
        return $result !== false ? (int)$result : null;
    }

    public function createAndReturnId(string $name, string $type, int $userId): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Categories (name, type, user_id)
            VALUES (:name, :type, :user_id)"
        );
        $stmt->execute([':name' => $name, ':type' => $type, ':user_id' => $userId]);
        return (int)$this->db->lastInsertId();
    }
}