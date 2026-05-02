<?php
require_once __DIR__ . '/../config/database.php';

class MyNotificationDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT notification_id, type, title, message, is_read, created_at
             FROM Notifications
             WHERE user_id = :uid
             ORDER BY created_at DESC"
        );
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getUnreadCount(int $userId): int {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM Notifications
             WHERE user_id = :uid AND is_read = 0"
        );
        $stmt->execute([':uid' => $userId]);
        return (int)$stmt->fetchColumn();
    }

    public function getRecent(int $userId, int $limit = 10): array {
        $stmt = $this->db->prepare(
            "SELECT notification_id, type, title, message, is_read, created_at
             FROM Notifications
             WHERE user_id = :uid
             ORDER BY created_at DESC
             LIMIT :lim"
        );
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit,  PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function markRead(int $id, int $userId): bool {
        $stmt = $this->db->prepare(
            "UPDATE Notifications
             SET is_read = 1
             WHERE notification_id = :id AND user_id = :uid"
        );
        return $stmt->execute([':id' => $id, ':uid' => $userId]);
    }

    public function markAllRead(int $userId): bool {
        $stmt = $this->db->prepare(
            "UPDATE Notifications SET is_read = 1 WHERE user_id = :uid"
        );
        return $stmt->execute([':uid' => $userId]);
    }

    public function delete(int $id, int $userId): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM Notifications
             WHERE notification_id = :id AND user_id = :uid"
        );
        return $stmt->execute([':id' => $id, ':uid' => $userId]);
    }

    public function create(int $userId, string $type, string $title, string $message): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Notifications (user_id, type, title, message, is_read, created_at)
             VALUES (:uid, :type, :title, :msg, 0, NOW())"
        );
        $stmt->execute([
            ':uid'   => $userId,
            ':type'  => $type,
            ':title' => $title,
            ':msg'   => $message,
        ]);
        return (int)$this->db->lastInsertId();
    }
}