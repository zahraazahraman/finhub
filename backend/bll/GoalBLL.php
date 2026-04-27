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
        $this->goalDal        = new GoalDAL();
        $this->accountDal     = new AccountDAL();
        $this->transactionDal = new TransactionDAL();
    }

    // ── Goals ──

    public function getByUser(int $userId): array {
        return $this->goalDal->getByUser($userId);
    }

    public function create(int $userId, array $data): array {
        $name       = trim($data['goal_name'] ?? '');
        $type       = $data['goal_type'] ?? '';
        $target     = (float)($data['target_amount'] ?? 0);
        $deadline   = !empty($data['deadline']) ? $data['deadline'] : null;
        $currencyId = (int)($data['currency_id'] ?? 0);

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
        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Please select a currency.'];

        $id = $this->goalDal->create($userId, $name, $type, $target, $deadline, $currencyId);
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
        $goalId         = (int)($data['goal_id']           ?? 0);
        $accountId      = (int)($data['account_id']        ?? 0);
        $amount         = (float)($data['amount']          ?? 0);
        $convertedAmount = isset($data['converted_amount']) ? (float)$data['converted_amount'] : null;
        $date           = $data['contribution_date']        ?? '';
        $description    = trim($data['description']        ?? '');

        // ── Basic validation ──
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

        // ── Goal not already completed ──
        if ((float)$goal['current_amount'] >= (float)$goal['target_amount'])
            return ['success' => false, 'message' => 'This goal is already completed.'];

        // ── Currency conversion ──
        $accountCurrency = strtoupper(trim($account['currency_code']));
        $goalCurrency    = strtoupper(trim($goal['currency_code']));

        $originalAmount       = null;
        $originalCurrencyCode = null;
        $exchangeRate         = null;
        // Use provided converted amount if available, otherwise calculate
        $finalConvertedAmount = $convertedAmount ?? $amount;

        if ($accountCurrency !== $goalCurrency) {
            if ($convertedAmount === null) {
                // No manual conversion provided, fetch from API with fallback
                $exchangeRate = $this->getExchangeRate($accountCurrency, $goalCurrency);

                if ($exchangeRate === null)
                    return ['success' => false, 'message' => 'Could not fetch exchange rate. Please try again.'];

                $finalConvertedAmount = round($amount * $exchangeRate, 2);
            }
            $originalAmount       = $amount;
            $originalCurrencyCode = $accountCurrency;
        } else {
            // Same currency, use the amount directly
            $finalConvertedAmount = $amount;
        }

        // ── Build transaction description ──
        $txDescription = !empty($description)
            ? $description
            : 'Goal contribution: ' . $goal['goal_name'];

        // ── Execute ──
        // Deduct original amount from account (what actually left)
        // Credit converted amount to goal (in goal's currency)
        $transactionId = $this->transactionDal->create($accountId, GOAL_CONTRIBUTION_CATEGORY_ID, $amount, 'expense', $txDescription, $date);
        $this->goalDal->createContribution(
            $goalId,
            $accountId,
            $finalConvertedAmount,
            $date,
            $description ?: null,
            $originalAmount,
            $originalCurrencyCode,
            $exchangeRate,
            $transactionId
        );
        $this->accountDal->updateBalance($accountId, -$amount);
        $this->goalDal->updateCurrentAmount($goalId, $finalConvertedAmount);

        return [
            'success'          => true,
            'converted_amount' => $finalConvertedAmount,
            'original_amount'  => $originalAmount,
            'exchange_rate'    => $exchangeRate,
            'goal_currency'    => $goalCurrency,
            'account_currency' => $accountCurrency,
        ];
    }

    public function deleteContribution(int $userId, int $contributionId): array {
        if ($contributionId <= 0)
            return ['success' => false, 'message' => 'Invalid contribution.'];

        $contribution = $this->goalDal->getContributionById($contributionId);
        if (!$contribution || (int)$contribution['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Contribution not found.'];

        // amount stored is always the converted (goal currency) amount
        $amount    = (float)$contribution['amount'];
        $accountId = (int)$contribution['account_id'];
        $goalId    = (int)$contribution['goal_id'];

        // original_amount is what actually left the account
        // if null, it was same-currency so use amount
        $accountRefund = $contribution['original_amount'] !== null
            ? (float)$contribution['original_amount']
            : $amount;

        // ── Reverse everything ──
        if (!empty($contribution['transaction_id'])) {
            $this->transactionDal->delete((int)$contribution['transaction_id']);
        }
        $this->goalDal->deleteContribution($contributionId);
        $this->accountDal->updateBalance($accountId, $accountRefund);
        $this->goalDal->updateCurrentAmount($goalId, -$amount);

        return ['success' => true];
    }

    // ── Helper: Get exchange rate with fallback ──
    private function getExchangeRate(string $from, string $to): ?float {
        // Try Frankfurter API first
        $rate = $this->tryFrankfurter($from, $to);
        if ($rate !== null) {
            return $rate;
        }

        // Fall back to open-source currency API
        return $this->tryOpenSourceAPI($from, $to);
    }

    // ── Try Frankfurter API ──
    private function tryFrankfurter(string $from, string $to): ?float {
        $supportedCurrencies = [
            'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
        ];

        // Only try if both currencies are supported
        if (!in_array($from, $supportedCurrencies) || !in_array($to, $supportedCurrencies)) {
            return null;
        }

        $url      = "https://api.frankfurter.app/latest?from={$from}&to={$to}";
        $response = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);

        if (!isset($data['rates'][$to])) {
            return null;
        }

        return (float)$data['rates'][$to];
    }

    // ── Try open-source currency API ──
    private function tryOpenSourceAPI(string $from, string $to): ?float {
        $url = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/{$from}.min.json";
        
        $response = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);

        // Navigate: { "usd": { "eur": 0.92, ... } }
        if (!isset($data[$from][strtolower($to)])) {
            return null;
        }

        return (float)$data[$from][strtolower($to)];
    }
}