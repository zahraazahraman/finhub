<?php
require_once __DIR__ . '/../config/database.php';

class DashboardDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getUserCounts(?string $from, ?string $to): array {
        $where = $this->dateWhere($from, $to, 'created_at');
        $stmt  = $this->db->query(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active'    THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive'  THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
             FROM Users $where"
        );
        return $stmt->fetch();
    }

    public function getConsultantCount(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM Consultants")->fetchColumn();
    }

    public function getCategoryCount(): int {
        return (int)$this->db->query("SELECT COUNT(*) FROM Categories")->fetchColumn();
    }

    public function getUnreadUserNotificationsCount(): int {
        return (int)$this->db->query(
            "SELECT COUNT(*) FROM Notifications WHERE is_read = 0"
        )->fetchColumn();
    }

    public function getUserRegistrationTimeline(int $year): array {
        $stmt = $this->db->prepare(
            "SELECT 
                MONTH(created_at) as month,
                COUNT(*) as count
             FROM Users
             WHERE YEAR(created_at) = :year
             GROUP BY MONTH(created_at)
             ORDER BY month ASC"
        );
        $stmt->execute([':year' => $year]);
        return $stmt->fetchAll();
    }

    public function getRecentUsers(int $limit = 5): array {
        $stmt = $this->db->prepare(
            "SELECT user_id, first_name, last_name, email, status, created_at
             FROM Users
             ORDER BY created_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getRecentAdminNotifications(int $limit = 5): array {
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

    public function getAvailableYears(): array {
        $stmt = $this->db->query(
            "SELECT DISTINCT YEAR(created_at) as year 
             FROM Users 
             ORDER BY year DESC"
        );
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    private function dateWhere(?string $from, ?string $to, string $col): string {
        if ($from && $to)   return "WHERE $col BETWEEN '$from' AND '$to 23:59:59'";
        if ($from)          return "WHERE $col >= '$from'";
        if ($to)            return "WHERE $col <= '$to 23:59:59'";
        return "";
    }
}
