<?php
require_once __DIR__ . '/../dal/MyNotificationDAL.php';

class MyNotificationBLL {
    private MyNotificationDAL $dal;

    public function __construct() {
        $this->dal = new MyNotificationDAL();
    }

    public function getAll(int $userId): array {
        return $this->dal->getByUser($userId);
    }

    public function getRecent(int $userId): array {
        return $this->dal->getRecent($userId, 10);
    }

    public function getUnreadCount(int $userId): array {
        $count = $this->dal->getUnreadCount($userId);
        return ['success' => true, 'count' => $count];
    }

    public function markRead(int $userId, int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid notification ID.'];
        $ok = $this->dal->markRead($id, $userId);
        if ($ok) return ['success' => true];
        return ['success' => false, 'message' => 'Failed to mark as read.'];
    }

    public function markAllRead(int $userId): array {
        $this->dal->markAllRead($userId);
        return ['success' => true];
    }

    public function delete(int $userId, int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid notification ID.'];
        $ok = $this->dal->delete($id, $userId);
        if ($ok) return ['success' => true];
        return ['success' => false, 'message' => 'Failed to delete notification.'];
    }
}