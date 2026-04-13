<?php
require_once __DIR__ . '/../config/database.php';

class GoalDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Goals
             WHERE user_id = :user_id
             ORDER BY created_at DESC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getById(int $goalId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Goals WHERE goal_id = :goal_id LIMIT 1"
        );
        $stmt->execute([':goal_id' => $goalId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(int $userId, string $name, string $type, float $target, ?string $deadline): int {
        $stmt = $this->db->prepare(
            "INSERT INTO Goals (user_id, goal_name, goal_type, target_amount, current_amount, deadline)
             VALUES (:user_id, :name, :type, :target, 0.00, :deadline)"
        );
        $stmt->execute([
            ':user_id'  => $userId,
            ':name'     => $name,
            ':type'     => $type,
            ':target'   => $target,
            ':deadline' => $deadline,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function delete(int $goalId): void {
        $stmt = $this->db->prepare(
            "DELETE FROM Goals WHERE goal_id = :goal_id"
        );
        $stmt->execute([':goal_id' => $goalId]);
    }

    public function updateCurrentAmount(int $goalId, float $delta): void {
        $stmt = $this->db->prepare(
            "UPDATE Goals SET current_amount = current_amount + :delta WHERE goal_id = :goal_id"
        );
        $stmt->execute([':delta' => $delta, ':goal_id' => $goalId]);
    }

    // ── Contributions ──

    public function getContributions(int $goalId): array {
        $stmt = $this->db->prepare(
            "SELECT gc.*, a.account_name
             FROM GoalContributions gc
             JOIN Accounts a ON gc.account_id = a.account_id
             WHERE gc.goal_id = :goal_id
             ORDER BY gc.contribution_date DESC, gc.created_at DESC"
        );
        $stmt->execute([':goal_id' => $goalId]);
        return $stmt->fetchAll();
    }

    public function getContributionById(int $contributionId): ?array {
        $stmt = $this->db->prepare(
            "SELECT gc.*, g.user_id
             FROM GoalContributions gc
             JOIN Goals g ON gc.goal_id = g.goal_id
             WHERE gc.contribution_id = :contribution_id
             LIMIT 1"
        );
        $stmt->execute([':contribution_id' => $contributionId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function createContribution(int $goalId, int $accountId, float $amount, string $date, ?string $description): int {
        $stmt = $this->db->prepare(
            "INSERT INTO GoalContributions (goal_id, account_id, amount, contribution_date, description)
             VALUES (:goal_id, :account_id, :amount, :date, :description)"
        );
        $stmt->execute([
            ':goal_id'     => $goalId,
            ':account_id'  => $accountId,
            ':amount'      => $amount,
            ':date'        => $date,
            ':description' => $description,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function deleteContribution(int $contributionId): void {
        $stmt = $this->db->prepare(
            "DELETE FROM GoalContributions WHERE contribution_id = :contribution_id"
        );
        $stmt->execute([':contribution_id' => $contributionId]);
    }
}