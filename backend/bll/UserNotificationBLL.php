<?php
require_once __DIR__ . '/../dal/UserNotificationDAL.php';

class UserNotificationBLL {
    private UserNotificationDAL $dal;

    public function __construct() {
        $this->dal = new UserNotificationDAL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function delete(int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid notification ID.'];
        $result = $this->dal->delete($id);
        if ($result) return ['success' => true, 'message' => 'Notification deleted successfully.'];
        return ['success' => false, 'message' => 'Failed to delete notification.'];
    }
}
