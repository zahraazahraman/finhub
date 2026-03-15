<?php
require_once __DIR__ . '/../dal/UserDAL.php';

class UserBLL {
    private UserDAL $dal;

    public function __construct() {
        $this->dal = new UserDAL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function updateStatus(int $userId, string $status): array {
        $allowed = ['active', 'inactive', 'suspended'];
        if (!in_array($status, $allowed)) {
            return ['success' => false, 'message' => 'Invalid status value.'];
        }
        $result = $this->dal->updateStatus($userId, $status);
        if ($result) {
            return ['success' => true, 'message' => 'Status updated successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to update status.'];
    }

    public function delete(int $userId): array {
        if ($userId <= 0) {
            return ['success' => false, 'message' => 'Invalid user ID.'];
        }
        $result = $this->dal->delete($userId);
        if ($result) {
            return ['success' => true, 'message' => 'User deleted successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to delete user.'];
    }
}