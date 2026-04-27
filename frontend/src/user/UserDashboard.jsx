import { useState, useEffect } from "react";
import UserDashboardBLL from "../bll/UserDashboardBLL.js";
import CurrenciesBLL from "../bll/CurrenciesBLL.js";
import DashboardStatCard           from "../components/dashboard/DashboardStatCard.jsx";
import DashboardFilters            from "../components/dashboard/DashboardFilters.jsx";
import DashboardBarChart           from "../components/dashboard/DashboardBarChart.jsx";
import DashboardDonutChart         from "../components/dashboard/DashboardDonutChart.jsx";
import DashboardGoals              from "../components/dashboard/DashboardGoals.jsx";
import DashboardRecentTransactions from "../components/dashboard/DashboardRecentTransactions.jsx";
import Select                      from "../components/ui/Select.jsx";
import Spinner                     from "../components/ui/Spinner.jsx";
import { formatCurrency }          from "../utils/formatters.js";

const today        = new Date();
const DEFAULT_FROM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
const DEFAULT_TO   = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
const DEFAULT_CURRENCY = "USD";

export default function UserDashboard() {
    // ── Filter state ──
    const [from, setFrom] = useState(DEFAULT_FROM);
    const [to,   setTo]   = useState(DEFAULT_TO);

    // ── Pending filter state ──
    const [pendingFrom, setPendingFrom] = useState(DEFAULT_FROM);
    const [pendingTo,   setPendingTo]   = useState(DEFAULT_TO);

    // ── Currency state ──
    const [currencies,       setCurrencies]       = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);

    // ── Data state ──
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const isFiltered =
        from !== DEFAULT_FROM ||
        to   !== DEFAULT_TO;

    const fetchData = async (params) => {
        setLoading(true);
        setError(null);
        const result = await UserDashboardBLL.getSummary(params);
        if (result.success) {
            setData(result);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    // ── Initial load ──
    useEffect(() => {
        const load = async () => {
            const currResult = await CurrenciesBLL.getAll();
            if (currResult.success) setCurrencies(currResult.currencies);

            fetchData({
                from,
                to,
                target_currency: DEFAULT_CURRENCY,
            });
        };
        load();
    }, []);

    // ── Re-fetch when selected currency changes ──
    useEffect(() => {
        if (!data) return; // skip on initial mount — already handled above
        fetchData({
            from,
            to,
            target_currency: selectedCurrency,
        });
    }, [selectedCurrency]);

    const handleApply = () => {
        setFrom(pendingFrom);
        setTo(pendingTo);
        fetchData({
            from:            pendingFrom,
            to:              pendingTo,
            target_currency: selectedCurrency,
        });
    };

    const handleReset = () => {
        setPendingFrom(DEFAULT_FROM);
        setPendingTo(DEFAULT_TO);
        setFrom(DEFAULT_FROM);
        setTo(DEFAULT_TO);
        fetchData({
            from:            DEFAULT_FROM,
            to:              DEFAULT_TO,
            target_currency: selectedCurrency,
        });
    };

    // ── Derived display values ──
    const selectedCurrencyObj = currencies.find(
        (c) => c.code.toUpperCase() === selectedCurrency
    );
    const currencySymbol = selectedCurrencyObj?.symbol ?? "$";

    const totalBalance  = data ? formatCurrency(data.total_balance,  currencySymbol) : "—";
    const periodIncome  = data ? formatCurrency(data.period_income,  currencySymbol) : "—";
    const periodExpense = data ? formatCurrency(data.period_expense, currencySymbol) : "—";
    const netSavings    = data ? formatCurrency(Math.abs(data.net_savings), currencySymbol) : "—";
    const netPositive   = data ? data.net_savings >= 0 : true;

    const hasMixedCurrencies = data
        ? new Set((data.accounts ?? []).map((a) => a.currency_code)).size > 1
        : false;

    const currencyOptions = currencies.map((c) => ({
        value: c.code,
        label: `${c.code} (${c.symbol})`,
    }));

    return (
        <main className="animate-fade-in">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-skin-text">Dashboard</h1>
                    <p className="text-skin-text-muted text-sm mt-0.5">
                        Your financial overview for the selected period
                    </p>
                </div>
                <div className="w-40">
                    <Select
                        options={currencyOptions}
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Mixed currency notice ── */}
            {hasMixedCurrencies && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl
                                bg-blue-500/10 border border-blue-500/20">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-blue-500 text-xs">
                        Your accounts use different currencies. All amounts are converted to {selectedCurrency} using live rates.
                    </p>
                </div>
            )}

            {/* ── Filters ── */}
            <DashboardFilters
                from={pendingFrom}
                to={pendingTo}
                onFromChange={setPendingFrom}
                onToChange={setPendingTo}
                onApply={handleApply}
                onReset={handleReset}
                isFiltered={isFiltered}
            />

            {/* ── Loading ── */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <Spinner size="lg" />
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20
                                    flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <p className="text-skin-text font-medium">{error}</p>
                    <button
                        onClick={() => fetchData({ from, to, target_currency: selectedCurrency })}
                        className="mt-4 text-emerald-500 text-sm hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ── Content ── */}
            {!loading && !error && data && (
                <>
                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <DashboardStatCard
                            label="Total Balance"
                            value={totalBalance}
                            sub={`Across ${(data.accounts ?? []).length} account${(data.accounts ?? []).length !== 1 ? "s" : ""} (${selectedCurrency})`}
                            color="emerald"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                                    <line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                            }
                        />
                        <DashboardStatCard
                            label="Period Income"
                            value={periodIncome}
                            sub={`Total earned · ${selectedCurrency}`}
                            color="blue"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                    <polyline points="17 6 23 6 23 12"/>
                                </svg>
                            }
                        />
                        <DashboardStatCard
                            label="Period Expenses"
                            value={periodExpense}
                            sub={`Total spent · ${selectedCurrency}`}
                            color="red"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                                    <polyline points="17 18 23 18 23 12"/>
                                </svg>
                            }
                        />
                        <DashboardStatCard
                            label="Net Savings"
                            value={netSavings}
                            sub={netPositive ? "You are saving this period" : "Spending exceeds income"}
                            color={netPositive ? "emerald" : "red"}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            }
                        />
                    </div>

                    {/* ── Charts ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <DashboardBarChart data={data.monthly_totals} />
                        <DashboardDonutChart
                            data={data.category_totals}
                        />
                    </div>

                    {/* ── Goals + Recent Transactions ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardGoals goals={data.active_goals} />
                        <DashboardRecentTransactions
                            transactions={data.recent_transactions}
                            loading={false}
                        />
                    </div>
                </>
            )}
        </main>
    );
}