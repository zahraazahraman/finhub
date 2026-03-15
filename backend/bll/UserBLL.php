<?php
require_once __DIR__ . '/../dal/UserDAL.php';
require_once __DIR__ . '/../bll/AdminNotificationBLL.php';

class UserBLL {
    private UserDAL $dal;
    private AdminNotificationBLL $notifier;

    public function __construct() {
        $this->dal      = new UserDAL();
        $this->notifier = new AdminNotificationBLL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function updateStatus(int $userId, string $status): array {
        $allowed = ['active', 'inactive', 'suspended'];
        if (!in_array($status, $allowed))
            return ['success' => false, 'message' => 'Invalid status value.'];

        // Get user info for notification
        $users = $this->dal->getAll();
        $user  = array_filter($users, fn($u) => $u['user_id'] == $userId);
        $user  = array_values($user)[0] ?? null;

        $result = $this->dal->updateStatus($userId, $status);
        if ($result) {
            if ($status === 'suspended' && $user) {
                $this->notifier->notify(
                    'user_suspended',
                    'User Suspended',
                    "{$user['first_name']} {$user['last_name']} has been suspended."
                );
            } elseif ($status === 'active' && $user) {
                $this->notifier->notify(
                    'user_registered',
                    'User Activated',
                    "{$user['first_name']} {$user['last_name']} has been reactivated."
                );
            }
            return ['success' => true, 'message' => 'Status updated successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to update status.'];
    }

    public function delete(int $userId): array {
        if ($userId <= 0)
            return ['success' => false, 'message' => 'Invalid user ID.'];

        // Get user info before deleting
        $users = $this->dal->getAll();
        $user  = array_filter($users, fn($u) => $u['user_id'] == $userId);
        $user  = array_values($user)[0] ?? null;

        $result = $this->dal->delete($userId);
        if ($result) {
            if ($user) {
                $this->notifier->notify(
                    'user_suspended',
                    'User Deleted',
                    "{$user['first_name']} {$user['last_name']} has been deleted."
                );
            }
            return ['success' => true, 'message' => 'User deleted successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to delete user.'];
    }
}
