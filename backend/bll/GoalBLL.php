<?php
require_once __DIR__ . '/../dal/GoalDAL.php';
require_once __DIR__ . '/../dal/AccountDAL.php';
require_once __DIR__ . '/../dal/TransactionDAL.php';

define('GOAL_CONTRIBUTION_CATEGORY_ID', 19);

class GoalBLL {
    private GoalDAL $goalDal;
    private AccountDAL $accountDal;
    private TransactionDAL $transactionDal;

    public function __construct() {
        $this->goalDal       = new GoalDAL();
        $this->accountDal    = new AccountDAL();
        $this->transactionDal = new TransactionDAL();
    }

    // ── Goals ──

    public function getByUser(int $userId): array {
        return $this->goalDal->getByUser($userId);
    }

    public function create(int $userId, array $data): array {
        $name     = trim($data['goal_name'] ?? '');
        $type     = $data['goal_type'] ?? '';
        $target   = (float)($data['target_amount'] ?? 0);
        $deadline = !empty($data['deadline']) ? $data['deadline'] : null;

        if (empty($name))
            return ['success' => false, 'message' => 'Goal name is required.'];
        if (strlen($name) > 100)
            return ['success' => false, 'message' => 'Goal name is too long.'];
        if (!in_array($type, ['saving', 'debt_repayment']))
            return ['success' => false, 'message' => 'Invalid goal type.'];
        if ($target <= 0)
            return ['success' => false, 'message' => 'Target amount must be greater than zero.'];
        if ($deadline !== null && $deadline < date('Y-m-d'))
            return ['success' => false, 'message' => 'Deadline cannot be in the past.'];

        $id = $this->goalDal->create($userId, $name, $type, $target, $deadline);
        return ['success' => true, 'goal_id' => $id];
    }

    public function delete(int $userId, int $goalId): array {
        if ($goalId <= 0)
            return ['success' => false, 'message' => 'Invalid goal.'];

        $goal = $this->goalDal->getById($goalId);
        if (!$goal || (int)$goal['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Goal not found.'];

        $this->goalDal->delete($goalId);
        return ['success' => true];
    }

    // ── Contributions ──

    public function getContributions(int $userId, int $goalId): array {
        $goal = $this->goalDal->getById($goalId);
        if (!$goal || (int)$goal['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Goal not found.'];

        $contributions = $this->goalDal->getContributions($goalId);
        return ['success' => true, 'contributions' => $contributions];
    }

    public function addContribution(int $userId, array $data): array {
        $goalId      = (int)($data['goal_id'] ?? 0);
        $accountId   = (int)($data['account_id'] ?? 0);
        $amount      = (float)($data['amount'] ?? 0);
        $date        = $data['contribution_date'] ?? '';
        $description = trim($data['description'] ?? '');

        // ── Validate ──
        if ($goalId <= 0)
            return ['success' => false, 'message' => 'Invalid goal.'];
        if ($accountId <= 0)
            return ['success' => false, 'message' => 'Please select an account.'];
        if ($amount <= 0)
            return ['success' => false, 'message' => 'Amount must be greater than zero.'];
        if (empty($date))
            return ['success' => false, 'message' => 'Contribution date is required.'];

        // ── Ownership checks ──
        $goal = $this->goalDal->getById($goalId);
        if (!$goal || (int)$goal['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Goal not found.'];

        $account = $this->accountDal->getById($accountId);
        if (!$account || (int)$account['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Account not found.'];

        // ── Sufficient balance check ──
        if ((float)$account['balance'] < $amount)
            return ['success' => false, 'message' => 'Insufficient account balance.'];

        // ── Check goal not already completed ──
        if ((float)$goal['current_amount'] >= (float)$goal['target_amount'])
            return ['success' => false, 'message' => 'This goal is already completed.'];

        // ── Build transaction description ──
        $txDescription = !empty($description)
            ? $description
            : 'Goal contribution: ' . $goal['goal_name'];

        // ── Execute ──
        $this->goalDal->createContribution($goalId, $accountId, $amount, $date, $description ?: null);
        $this->transactionDal->create($accountId, GOAL_CONTRIBUTION_CATEGORY_ID, $amount, 'expense', $txDescription, $date);
        $this->accountDal->updateBalance($accountId, -$amount);
        $this->goalDal->updateCurrentAmount($goalId, $amount);

        return ['success' => true];
    }

    public function deleteContribution(int $userId, int $contributionId): array {
        if ($contributionId <= 0)
            return ['success' => false, 'message' => 'Invalid contribution.'];

        $contribution = $this->goalDal->getContributionById($contributionId);
        if (!$contribution || (int)$contribution['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Contribution not found.'];

        $amount    = (float)$contribution['amount'];
        $accountId = (int)$contribution['account_id'];
        $goalId    = (int)$contribution['goal_id'];

        // ── Reverse everything ──
        $this->goalDal->deleteContribution($contributionId);
        $this->accountDal->updateBalance($accountId, $amount);
        $this->goalDal->updateCurrentAmount($goalId, -$amount);

        return ['success' => true];
    }
}