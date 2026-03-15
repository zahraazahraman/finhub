<?php
require_once __DIR__ . '/../config/database.php';

class AdminNotificationDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT notification_id, type, title, message, is_read, created_at
             FROM AdminNotifications
             ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function getUnreadCount(): int {
        $stmt = $this->db->query(
            "SELECT COUNT(*) FROM AdminNotifications WHERE is_read = 0"
        );
        return (int)$stmt->fetchColumn();
    }

    public function getRecent(int $limit = 5): array {
        $stmt = $this->db->prepare(
            "SELECT notification_id, type, title, message, is_read, created_at
             FROM AdminNotifications
             ORDER BY created_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function markRead(int $id): bool {
        $stmt = $this->db->prepare(
            "UPDATE AdminNotifications SET is_read = 1 WHERE notification_id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }

    public function markAllRead(): bool {
        return $this->db->exec("UPDATE AdminNotifications SET is_read = 1") !== false;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM AdminNotifications WHERE notification_id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }

    public function create(string $type, string $title, string $message): bool {
        $stmt = $this->db->prepare(
            "INSERT INTO AdminNotifications (type, title, message)
            VALUES (:type, :title, :message)"
        );
        return $stmt->execute([
            ':type'    => $type,
            ':title'   => $title,
            ':message' => $message,
        ]);
    }
}