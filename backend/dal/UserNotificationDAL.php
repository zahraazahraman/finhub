<?php
require_once __DIR__ . '/../config/database.php';

class UserNotificationDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT n.notification_id, n.type, n.title, n.message, 
                    n.is_read, n.created_at,
                    u.first_name, u.last_name, u.email
             FROM Notifications n
             LEFT JOIN Users u ON n.user_id = u.user_id
             ORDER BY n.created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM Notifications WHERE notification_id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }
}
