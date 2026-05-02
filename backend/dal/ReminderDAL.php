<?php
require_once __DIR__ . '/../config/database.php';

class ReminderDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByBill(int $billId): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Reminders WHERE bill_id = :bill_id ORDER BY reminder_date ASC"
        );
        $stmt->execute([':bill_id' => $billId]);
        return $stmt->fetchAll();
    }

    public function getById(int $reminderId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Reminders WHERE reminder_id = :reminder_id LIMIT 1"
        );
        $stmt->execute([':reminder_id' => $reminderId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function countByUser(int $userId): int {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM Reminders WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => $userId]);
        return (int)$stmt->fetchColumn();
    }

    public function create(
        int $userId,
        int $billId,
        string $message,
        string $reminderDate,
        int $daysBefore
    ): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Reminders (user_id, bill_id, message, reminder_date, days_before, is_sent)
             VALUES (:user_id, :bill_id, :message, :reminder_date, :days_before, 0)"
        );
        $stmt->execute([
            ':user_id'       => $userId,
            ':bill_id'       => $billId,
            ':message'       => $message,
            ':reminder_date' => $reminderDate,
            ':days_before'   => $daysBefore,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function delete(int $reminderId): void {
        $stmt = $this->db->prepare("DELETE FROM Reminders WHERE reminder_id = :reminder_id");
        $stmt->execute([':reminder_id' => $reminderId]);
    }

    public function deleteByBill(int $billId): void {
        $stmt = $this->db->prepare("DELETE FROM Reminders WHERE bill_id = :bill_id");
        $stmt->execute([':bill_id' => $billId]);
    }

    public function update(int $reminderId, int $daysBefore, string $reminderDate): bool {
        $stmt = $this->db->prepare(
            "UPDATE Reminders SET days_before = :days_before, reminder_date = :reminder_date WHERE reminder_id = :reminder_id"
        );
        $stmt->execute([
            ':days_before'   => $daysBefore,
            ':reminder_date' => $reminderDate,
            ':reminder_id'   => $reminderId,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function getDueForUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT r.*, b.name AS bill_name, b.amount, b.due_date,
                    c.code AS currency_code, c.symbol AS currency_symbol
             FROM Reminders r
             JOIN Bills b ON r.bill_id = b.bill_id
             JOIN Currencies c ON b.currency_id = c.currency_id
             WHERE r.user_id = :user_id
               AND r.is_sent = 0
               AND r.reminder_date <= NOW()
               AND b.is_paid = 0"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function markAsSent(int $reminderId): void {
        $stmt = $this->db->prepare("UPDATE Reminders SET is_sent = 1 WHERE reminder_id = :reminder_id");
        $stmt->execute([':reminder_id' => $reminderId]);
    }

    public function logEmail(int $userId, string $emailType, string $status): void {
        $stmt = $this->db->prepare(
            "INSERT INTO EmailLogs (user_id, email_type, status) VALUES (:user_id, :type, :status)"
        );
        $stmt->execute([':user_id' => $userId, ':type' => $emailType, ':status' => $status]);
    }

    public function getLastWeeklySummary(int $userId): ?string {
        $stmt = $this->db->prepare(
            "SELECT sent_at FROM EmailLogs
             WHERE user_id = :user_id AND email_type = 'weekly_summary' AND status = 'sent'
             ORDER BY sent_at DESC LIMIT 1"
        );
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetchColumn();
        return $result ?: null;
    }
}