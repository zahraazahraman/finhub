<?php
require_once __DIR__ . '/../dal/InvestmentDAL.php';

class InvestmentBLL {
    private InvestmentDAL $dal;

    public function __construct() {
        $this->dal = new InvestmentDAL();
    }

    public function getByUser(int $userId): array {
        return $this->dal->getByUser($userId);
    }

    public function create(int $userId, array $data): array {
        $name          = trim($data['investment_name'] ?? '');
        $symbol        = !empty($data['symbol']) ? strtoupper(trim($data['symbol'])) : null;
        $type          = $data['investment_type'] ?? '';
        $quantity      = (float)($data['quantity'] ?? 0);
        $purchasePrice = (float)($data['purchase_price'] ?? 0);
        $currentPrice  = (isset($data['current_price']) && $data['current_price'] !== '')
                            ? (float)$data['current_price']
                            : null;
        $currencyId    = (int)($data['currency_id'] ?? 0);
        $purchaseDate  = $data['purchase_date'] ?? '';
        $notes         = !empty($data['notes']) ? trim($data['notes']) : null;

        if (empty($name))
            return ['success' => false, 'message' => 'Investment name is required.'];
        if (strlen($name) > 255)
            return ['success' => false, 'message' => 'Investment name is too long.'];
        if (!in_array($type, ['stock', 'crypto', 'real_estate', 'other']))
            return ['success' => false, 'message' => 'Invalid investment type.'];
        if ($quantity <= 0)
            return ['success' => false, 'message' => 'Quantity must be greater than zero.'];
        if ($purchasePrice <= 0)
            return ['success' => false, 'message' => 'Purchase price must be greater than zero.'];
        if ($currentPrice !== null && $currentPrice < 0)
            return ['success' => false, 'message' => 'Current price cannot be negative.'];
        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Please select a currency.'];
        if (empty($purchaseDate))
            return ['success' => false, 'message' => 'Purchase date is required.'];

        $id = $this->dal->create(
            $userId, $name, $symbol, $type, $quantity,
            $purchasePrice, $currentPrice, $currencyId, $purchaseDate, $notes
        );
        return ['success' => true, 'investment_id' => $id];
    }

    public function delete(int $userId, int $investmentId): array {
        if ($investmentId <= 0)
            return ['success' => false, 'message' => 'Invalid investment.'];

        $investment = $this->dal->getById($investmentId);
        if (!$investment || (int)$investment['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Investment not found.'];

        $this->dal->delete($investmentId);
        return ['success' => true];
    }

    // ── Auto price update: stock (Finnhub) + crypto (CoinGecko) ──
    // Prices are fetched in USD, then converted to each investment's currency.
    public function updatePrices(int $userId): array {
        $investments = $this->dal->getByUser($userId);
        $updated     = [];

        foreach ($investments as $inv) {
            $type         = $inv['investment_type'];
            $symbol       = $inv['symbol'] ?? '';
            $currencyCode = strtoupper(trim($inv['currency_code'] ?? 'USD'));

            // Only auto-update stock and crypto, and only if symbol is set
            if (!in_array($type, ['stock', 'crypto']) || empty($symbol)) {
                continue;
            }

            // Fetch live price in USD
            $priceUsd = null;
            if ($type === 'stock') {
                $priceUsd = $this->fetchStockPrice($symbol);
            } elseif ($type === 'crypto') {
                $priceUsd = $this->fetchCryptoPrice($symbol);
            }

            if ($priceUsd === null || $priceUsd <= 0) {
                continue;
            }

            // Convert USD → investment currency if needed
            $finalPrice = $priceUsd;
            if ($currencyCode !== 'USD') {
                $rate = $this->getExchangeRate('USD', $currencyCode);
                if ($rate !== null) {
                    $finalPrice = round($priceUsd * $rate, 6);
                }
                // If rate fetch fails, skip this investment rather than store wrong currency
                else {
                    continue;
                }
            }

            $this->dal->updateCurrentPrice((int)$inv['investment_id'], $finalPrice);
            $updated[] = [
                'investment_id' => (int)$inv['investment_id'],
                'current_price' => $finalPrice,
            ];
        }

        return ['success' => true, 'updated' => $updated];
    }

    // ── Manual price update: real_estate + other ──
    public function updateManualPrice(int $userId, int $investmentId, float $price): array {
        if ($investmentId <= 0)
            return ['success' => false, 'message' => 'Invalid investment.'];
        if ($price < 0)
            return ['success' => false, 'message' => 'Price cannot be negative.'];

        $investment = $this->dal->getById($investmentId);
        if (!$investment || (int)$investment['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Investment not found.'];

        if (in_array($investment['investment_type'], ['stock', 'crypto']))
            return ['success' => false, 'message' => 'Stock and crypto prices are updated automatically.'];

        $this->dal->updateCurrentPrice($investmentId, $price);
        return ['success' => true, 'current_price' => $price];
    }

    // ── Finnhub: fetch stock quote in USD ──
    private function fetchStockPrice(string $symbol): ?float {
        $apiKey = $_ENV['FINNHUB_API_KEY'] ?? '';
        if (empty($apiKey)) return null;

        $url      = "https://finnhub.io/api/v1/quote?symbol=" . urlencode($symbol) . "&token=" . urlencode($apiKey);
        $response = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($response === false) return null;

        $data = json_decode($response, true);

        // Finnhub returns c=0 when symbol is not found
        if (!isset($data['c']) || (float)$data['c'] <= 0) return null;

        return round((float)$data['c'], 6);
    }

    // ── CoinGecko: fetch crypto price in USD ──
    private function fetchCryptoPrice(string $symbol): ?float {
        // Step 1 — resolve symbol to CoinGecko ID
        $searchUrl = "https://api.coingecko.com/api/v3/search?query=" . urlencode($symbol);
        $searchRes = @file_get_contents($searchUrl, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($searchRes === false) return null;

        $searchData = json_decode($searchRes, true);
        $coins      = $searchData['coins'] ?? [];

        $coinId = null;
        foreach ($coins as $coin) {
            if (strtolower($coin['symbol']) === strtolower($symbol)) {
                $coinId = $coin['id'];
                break;
            }
        }

        if (!$coinId) return null;

        // Step 2 — fetch price in USD
        $priceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=" . urlencode($coinId) . "&vs_currencies=usd";
        $priceRes = @file_get_contents($priceUrl, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($priceRes === false) return null;

        $priceData = json_decode($priceRes, true);

        if (!isset($priceData[$coinId]['usd'])) return null;

        return round((float)$priceData[$coinId]['usd'], 6);
    }

    // ── Exchange rate: USD → target currency ──
    // Uses Frankfurter first, falls back to open-source currency API.
    private function getExchangeRate(string $from, string $to): ?float {
        $rate = $this->tryFrankfurter($from, $to);
        if ($rate !== null) return $rate;
        return $this->tryOpenSourceAPI($from, $to);
    }

    private function tryFrankfurter(string $from, string $to): ?float {
        $supported = [
            'AUD','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP','HKD','HUF',
            'IDR','ILS','INR','ISK','JPY','KRW','MXN','MYR','NOK','NZD','PHP',
            'PLN','RON','SEK','SGD','THB','TRY','USD','ZAR'
        ];

        if (!in_array($from, $supported) || !in_array($to, $supported)) return null;

        $url      = "https://api.frankfurter.app/latest?from={$from}&to={$to}";
        $response = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($response === false) return null;

        $data = json_decode($response, true);
        if (!isset($data['rates'][$to])) return null;

        return (float)$data['rates'][$to];
    }

    private function tryOpenSourceAPI(string $from, string $to): ?float {
        $url      = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/" . strtolower($from) . ".min.json";
        $response = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 5]]));

        if ($response === false) return null;

        $data = json_decode($response, true);
        if (!isset($data[strtolower($from)][strtolower($to)])) return null;

        return (float)$data[strtolower($from)][strtolower($to)];
    }
}