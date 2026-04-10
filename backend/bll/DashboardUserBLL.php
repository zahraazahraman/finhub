<?php
require_once __DIR__ . '/../dal/DashboardUserDAL.php';

class DashboardUserBLL {
    private DashboardUserDAL $dal;

    public function __construct() {
        $this->dal = new DashboardUserDAL();
    }

    public function getSummary(int $userId, ?string $from, ?string $to, string $categoryType, ?int $categoryId): array {

        // --- Date range defaults to current month ---
        $from = $this->resolveDate($from, date('Y-m-01'));
        $to   = $this->resolveDate($to,   date('Y-m-t'));

        // --- Swap if from > to ---
        if ($from > $to) [$from, $to] = [$to, $from];

        // --- Category type must be income or expense ---
        if (!in_array($categoryType, ['income', 'expense'])) {
            $categoryType = 'expense';
        }

        // --- Fetch all data ---
        $accounts            = $this->dal->getAccounts($userId);
        $monthlyRaw          = $this->dal->getMonthlyTotals($userId, $from, $to);
        $categoryTotals      = $this->dal->getCategoryTotals($userId, $categoryType, $from, $to);
        $periodIncome        = $this->dal->getPeriodTotal($userId, 'income',  $from, $to);
        $periodExpense       = $this->dal->getPeriodTotal($userId, 'expense', $from, $to);
        $recentTransactions  = $this->dal->getRecentTransactions($userId, $from, $to, $categoryId);
        $activeGoals         = $this->dal->getActiveGoals($userId);

        // --- Total balance across all accounts ---
        $totalBalance = array_sum(array_column($accounts, 'balance'));

        // --- Net savings ---
        $netSavings = $periodIncome - $periodExpense;

        // --- Shape monthly totals into { month, income, expense } array ---
        $monthlyTotals = $this->shapeMonthlyTotals($monthlyRaw, $from, $to);

        // --- Add progress % to goals ---
        $goals = array_map(function ($goal) {
            $goal['progress'] = $goal['target_amount'] > 0
                ? round(($goal['current_amount'] / $goal['target_amount']) * 100, 1)
                : 0;
            return $goal;
        }, $activeGoals);

        return [
            'success'            => true,
            'from'               => $from,
            'to'                 => $to,
            'accounts'           => $accounts,
            'total_balance'      => round($totalBalance, 2),
            'period_income'      => round($periodIncome, 2),
            'period_expense'     => round($periodExpense, 2),
            'net_savings'        => round($netSavings, 2),
            'monthly_totals'     => $monthlyTotals,
            'category_totals'    => $categoryTotals,
            'category_type'      => $categoryType,
            'recent_transactions'=> $recentTransactions,
            'active_goals'       => $goals,
        ];
    }

    // --- Helpers ---

    private function resolveDate(?string $date, string $fallback): string {
        if ($date && strtotime($date)) return $date;
        return $fallback;
    }

    // Fills in every month in the range with income + expense,
    // even months with no transactions (returns 0s so chart has no gaps)
    private function shapeMonthlyTotals(array $raw, string $from, string $to): array {
        // Index raw rows by month+type
        $indexed = [];
        foreach ($raw as $row) {
            $indexed[$row['month']][$row['transaction_type']] = (float)$row['total'];
        }

        // Build full month list from from→to
        $months = [];
        $cursor = date('Y-m', strtotime($from));
        $end    = date('Y-m', strtotime($to));

        while ($cursor <= $end) {
            $months[] = [
                'month'   => $cursor,
                'income'  => $indexed[$cursor]['income']  ?? 0,
                'expense' => $indexed[$cursor]['expense'] ?? 0,
            ];
            $cursor = date('Y-m', strtotime($cursor . '-01 +1 month'));
        }

        return $months;
    }
}