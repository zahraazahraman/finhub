<?php
require_once __DIR__ . '/../dal/DashboardUserDAL.php';

class DashboardUserBLL {
    private DashboardUserDAL $dal;

    public function __construct() {
        $this->dal = new DashboardUserDAL();
    }

    public function getSummary(
        int $userId,
        ?string $from,
        ?string $to,
        string $categoryType,
        ?int $categoryId,
        string $targetCurrency = 'USD'
    ): array {

        // ── Date range defaults to current month ──
        $from = $this->resolveDate($from, date('Y-m-01'));
        $to   = $this->resolveDate($to,   date('Y-m-t'));
        if ($from > $to) [$from, $to] = [$to, $from];

        // ── Category type guard ──
        if (!in_array($categoryType, ['income', 'expense']))
            $categoryType = 'expense';

        $targetCurrency = strtoupper(trim($targetCurrency));

        // ── Fetch all raw data ──
        $accounts           = $this->dal->getAccounts($userId);
        $monthlyRaw         = $this->dal->getMonthlyTotals($userId, $from, $to);
        $categoryRaw        = $this->dal->getCategoryTotals($userId, $categoryType, $from, $to);
        $incomeRows         = $this->dal->getPeriodRows($userId, 'income',  $from, $to);
        $expenseRows        = $this->dal->getPeriodRows($userId, 'expense', $from, $to);
        $recentTransactions = $this->dal->getRecentTransactions($userId, $from, $to, $categoryId);
        $activeGoals        = $this->dal->getActiveGoals($userId);

        // ── Collect all distinct foreign currencies ──
        $allCurrencies = [];
        foreach ($accounts    as $row) $allCurrencies[] = strtoupper($row['currency_code'] ?? '');
        foreach ($monthlyRaw  as $row) $allCurrencies[] = strtoupper($row['currency_code'] ?? '');
        foreach ($categoryRaw as $row) $allCurrencies[] = strtoupper($row['currency_code'] ?? '');
        foreach ($incomeRows  as $row) $allCurrencies[] = strtoupper($row['currency_code'] ?? '');
        foreach ($expenseRows as $row) $allCurrencies[] = strtoupper($row['currency_code'] ?? '');

        $foreignCurrencies = array_values(array_unique(array_filter(
            $allCurrencies,
            fn($c) => $c !== '' && $c !== $targetCurrency
        )));

        // ── Build rate map: { 'EUR' => 1.08, 'GBP' => 1.27, ... } ──
        $rateMap = $this->buildRateMap($foreignCurrencies, $targetCurrency);

        // ── Total balance ──
        $totalBalance = 0;
        foreach ($accounts as $account) {
            $totalBalance += $this->convertAmount(
                (float)$account['balance'],
                strtoupper($account['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            );
        }

        // ── Period income + expense ──
        $periodIncome = 0;
        foreach ($incomeRows as $row) {
            $periodIncome += $this->convertAmount(
                (float)$row['total'],
                strtoupper($row['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            );
        }

        $periodExpense = 0;
        foreach ($expenseRows as $row) {
            $periodExpense += $this->convertAmount(
                (float)$row['total'],
                strtoupper($row['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            );
        }

        // ── Monthly totals — merge rows by month+type after conversion ──
        $monthlyTotals = $this->shapeMonthlyTotals($monthlyRaw, $from, $to, $targetCurrency, $rateMap);

        // ── Category totals — merge rows by category after conversion ──
        $categoryTotals = $this->shapeCategoryTotals($categoryRaw, $targetCurrency, $rateMap);

        // ── Goals — add progress % and convert to target currency ──
        $goals = array_map(function ($goal) use ($targetCurrency, $rateMap) {
            $goal['current_amount'] = round($this->convertAmount(
                (float)$goal['current_amount'],
                strtoupper($goal['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            ), 2);
            $goal['target_amount'] = round($this->convertAmount(
                (float)$goal['target_amount'],
                strtoupper($goal['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            ), 2);
            $goal['currency_code'] = $targetCurrency;
            $goal['currency_symbol'] = $this->getCurrencySymbol($targetCurrency);
            $goal['progress'] = $goal['target_amount'] > 0
                ? round(($goal['current_amount'] / $goal['target_amount']) * 100, 1)
                : 0;
            return $goal;
        }, $activeGoals);

        // ── Recent transactions — convert amounts to target currency ──
        $convertedTransactions = array_map(function ($tx) use ($targetCurrency, $rateMap) {
            $tx['amount'] = round($this->convertAmount(
                (float)$tx['amount'],
                strtoupper($tx['currency_code'] ?? $targetCurrency),
                $targetCurrency,
                $rateMap
            ), 2);
            $tx['currency_symbol'] = $this->getCurrencySymbol($targetCurrency);
            return $tx;
        }, $recentTransactions);

        return [
            'success'             => true,
            'from'                => $from,
            'to'                  => $to,
            'target_currency'     => $targetCurrency,
            'accounts'            => $accounts,
            'total_balance'       => round($totalBalance,  2),
            'period_income'       => round($periodIncome,  2),
            'period_expense'      => round($periodExpense, 2),
            'net_savings'         => round($periodIncome - $periodExpense, 2),
            'monthly_totals'      => $monthlyTotals,
            'category_totals'     => $categoryTotals,
            'category_type'       => $categoryType,
            'recent_transactions' => $convertedTransactions,
            'active_goals'        => $goals,
        ];
    }

    // ── Build rate map: foreign currency → target currency rate ──
    // Frankfurter is the primary source (~30 major currencies).
    // Currencies it doesn't support (LBP, AED, SAR, EGP, …) are resolved in a
    // single batched call to fawazahmed0 v2, which covers 160+ currencies.
    private function buildRateMap(array $foreignCurrencies, string $targetCurrency): array {
        $rateMap      = [];
        $needFallback = [];

        // ── Primary: Frankfurter ──
        foreach ($foreignCurrencies as $from) {
            if ($from === $targetCurrency) continue;

            $url      = FRANKFURTER_API_URL . "/latest?from={$from}&to={$targetCurrency}";
            $response = @file_get_contents($url);

            if ($response !== false) {
                $data = json_decode($response, true);
                if (isset($data['rates'][$targetCurrency])) {
                    $rateMap[$from] = (float)$data['rates'][$targetCurrency];
                    continue;
                }
            }

            $needFallback[] = $from;
        }

        // ── Fallback: fawazahmed0 v2 — one batched call for all missing currencies ──
        if (!empty($needFallback)) {
            $targetLower = strtolower($targetCurrency);
            $url         = FAWAZAHMED0_API_URL . "/{$targetLower}.min.json";
            $response    = @file_get_contents($url);

            if ($response !== false) {
                $data = json_decode($response, true);
                foreach ($needFallback as $from) {
                    $fromLower = strtolower($from);
                    // Response: { "eur": { "lbp": 103846, … } } — invert to get FROM→TARGET rate
                    $inverse = $data[$targetLower][$fromLower] ?? 0;
                    $rateMap[$from] = ($inverse > 0) ? (1.0 / $inverse) : 1.0;
                }
            } else {
                foreach ($needFallback as $from) {
                    $rateMap[$from] = 1.0;
                }
            }
        }

        return $rateMap;
    }

    // ── Convert a single amount using the rate map ──
    private function convertAmount(float $amount, string $fromCurrency, string $targetCurrency, array $rateMap): float {
        if ($fromCurrency === $targetCurrency) return $amount;
        $rate = $rateMap[$fromCurrency] ?? 1.0;
        return $amount * $rate;
    }

    // ── Get currency symbol for a currency code ──
    private function getCurrencySymbol(string $currencyCode): string {
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
            'CAD' => 'C$',
            'AUD' => 'A$',
            'CHF' => 'CHF',
            'CNY' => '¥',
            'LBP' => 'LL',
        ];
        return $symbols[strtoupper($currencyCode)] ?? '$';
    }

    // ── Shape monthly totals — convert + merge by month+type ──
    private function shapeMonthlyTotals(array $raw, string $from, string $to, string $targetCurrency, array $rateMap): array {
        // Accumulate converted amounts per month+type
        $indexed = [];
        foreach ($raw as $row) {
            $month    = $row['month'];
            $type     = $row['transaction_type'];
            $currency = strtoupper($row['currency_code'] ?? $targetCurrency);
            $amount   = $this->convertAmount((float)$row['total'], $currency, $targetCurrency, $rateMap);

            if (!isset($indexed[$month][$type])) $indexed[$month][$type] = 0;
            $indexed[$month][$type] += $amount;
        }

        // Fill every month in range, even months with no transactions
        $months = [];
        $cursor = date('Y-m', strtotime($from));
        $end    = date('Y-m', strtotime($to));

        while ($cursor <= $end) {
            $months[] = [
                'month'   => $cursor,
                'income'  => round($indexed[$cursor]['income']  ?? 0, 2),
                'expense' => round($indexed[$cursor]['expense'] ?? 0, 2),
            ];
            $cursor = date('Y-m', strtotime($cursor . '-01 +1 month'));
        }

        return $months;
    }

    // ── Shape category totals — convert + merge by category name ──
    private function shapeCategoryTotals(array $raw, string $targetCurrency, array $rateMap): array {
        $merged = [];
        foreach ($raw as $row) {
            $name     = $row['category_name'];
            $currency = strtoupper($row['currency_code'] ?? $targetCurrency);
            $amount   = $this->convertAmount((float)$row['total'], $currency, $targetCurrency, $rateMap);

            if (!isset($merged[$name])) $merged[$name] = 0;
            $merged[$name] += $amount;
        }

        // Re-shape into array and sort by total descending
        $result = [];
        foreach ($merged as $name => $total) {
            $result[] = ['category_name' => $name, 'total' => round($total, 2)];
        }
        usort($result, fn($a, $b) => $b['total'] <=> $a['total']);

        return $result;
    }

    private function resolveDate(?string $date, string $fallback): string {
        if ($date && strtotime($date)) return $date;
        return $fallback;
    }
}