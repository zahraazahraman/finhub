<?php
require_once __DIR__ . '/../dal/TransactionDAL.php';
require_once __DIR__ . '/../dal/AccountDAL.php';

class TransactionBLL {
    private TransactionDAL $dal;
    private AccountDAL $accountDal;

    public function __construct() {
        $this->dal        = new TransactionDAL();
        $this->accountDal = new AccountDAL();
    }

    public function getByAccount(int $userId, int $accountId): array {
        if ($accountId <= 0) return [];
        $account = $this->accountDal->getById($accountId);
        if (!$account || (int)$account['user_id'] !== $userId) return [];
        return $this->dal->getByAccount($accountId);
    }

    public function create(int $userId, array $data): array {
        $accountId   = (int)($data['account_id'] ?? 0);
        $categoryId  = !empty($data['category_id']) ? (int)$data['category_id'] : null;
        $amount      = (float)($data['amount'] ?? 0);
        $type        = $data['transaction_type'] ?? '';
        $description = trim($data['description'] ?? '');
        $date        = $data['transaction_date'] ?? '';

        if ($accountId <= 0)
            return ['success' => false, 'message' => 'Account is required.'];
        if ($amount <= 0)
            return ['success' => false, 'message' => 'Amount must be greater than 0.'];
        if (!in_array($type, ['income', 'expense', 'transfer']))
            return ['success' => false, 'message' => 'Invalid transaction type.'];
        if (empty($date))
            return ['success' => false, 'message' => 'Date is required.'];

        $account = $this->accountDal->getById($accountId);
        if (!$account || (int)$account['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Account not found.'];

        $delta = ($type === 'income') ? $amount : -$amount;
        $this->dal->create($accountId, $categoryId, $amount, $type, $description, $date);
        $this->accountDal->updateBalance($accountId, $delta);

        return ['success' => true];
    }

    public function delete(int $userId, int $transactionId): array {
        if ($transactionId <= 0)
            return ['success' => false, 'message' => 'Invalid transaction.'];

        $transaction = $this->dal->getById($transactionId);
        if (!$transaction || (int)$transaction['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Transaction not found.'];

        $type   = $transaction['transaction_type'];
        $amount = (float)$transaction['amount'];
        $delta  = ($type === 'income') ? -$amount : $amount;

        $this->dal->delete($transactionId);
        $this->accountDal->updateBalance((int)$transaction['account_id'], $delta);

        return ['success' => true];
    }
}
