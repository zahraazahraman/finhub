<?php
require_once __DIR__ . '/../dal/AccountDAL.php';

class AccountBLL {
    private AccountDAL $dal;

    public function __construct() {
        $this->dal = new AccountDAL();
    }

    public function getByUser(int $userId): array {
        return $this->dal->getByUser($userId);
    }

    public function create(int $userId, array $data): array {
        $name       = trim($data['account_name'] ?? '');
        $type       = $data['account_type'] ?? '';
        $currencyId = (int)($data['currency_id'] ?? 0);

        if (empty($name))
            return ['success' => false, 'message' => 'Account name is required.'];
        if (strlen($name) > 100)
            return ['success' => false, 'message' => 'Account name is too long.'];
        if (!in_array($type, ['bank', 'cash', 'credit_card', 'wallet']))
            return ['success' => false, 'message' => 'Invalid account type.'];
        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Currency is required.'];

        $id = $this->dal->create($userId, $name, $type, $currencyId);
        return ['success' => true, 'account_id' => $id];
    }

    public function delete(int $userId, int $accountId): array {
        if ($accountId <= 0)
            return ['success' => false, 'message' => 'Invalid account.'];

        $account = $this->dal->getById($accountId);
        if (!$account || (int)$account['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Account not found.'];

        $this->dal->delete($accountId);
        return ['success' => true];
    }
}
