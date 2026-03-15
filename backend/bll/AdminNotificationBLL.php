<?php
require_once __DIR__ . '/../dal/AdminNotificationDAL.php';

class AdminNotificationBLL {
    private AdminNotificationDAL $dal;

    public function __construct() {
        $this->dal = new AdminNotificationDAL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function getUnreadCount(): array {
        $count = $this->dal->getUnreadCount();
        return ['success' => true, 'count' => $count];
    }

    public function getRecent(): array {
        $notifications = $this->dal->getRecent(5);
        return ['success' => true, 'notifications' => $notifications];
    }

    public function markRead(int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid notification ID.'];
        $result = $this->dal->markRead($id);
        if ($result) return ['success' => true];
        return ['success' => false, 'message' => 'Failed to mark as read.'];
    }

    public function markAllRead(): array {
        $result = $this->dal->markAllRead();
        if ($result) return ['success' => true];
        return ['success' => false, 'message' => 'Failed to mark all as read.'];
    }

    public function delete(int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid notification ID.'];
        $result = $this->dal->delete($id);
        if ($result) return ['success' => true];
        return ['success' => false, 'message' => 'Failed to delete notification.'];
    }
}