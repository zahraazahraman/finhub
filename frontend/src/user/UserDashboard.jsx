import { useState, useEffect } from "react";
import UserDashboardBLL from "../bll/UserDashboardBLL.js";
import DashboardStatCard          from "../components/dashboard/DashboardStatCard.jsx";
import DashboardFilters           from "../components/dashboard/DashboardFilters.jsx";
import DashboardBarChart          from "../components/dashboard/DashboardBarChart.jsx";
import DashboardDonutChart        from "../components/dashboard/DashboardDonutChart.jsx";
import DashboardGoals             from "../components/dashboard/DashboardGoals.jsx";
import DashboardRecentTransactions from "../components/dashboard/DashboardRecentTransactions.jsx";
import Spinner                    from "../components/ui/Spinner.jsx";
import { formatCurrency }         from "../utils/formatters.js";

// Default to current month
const today      = new Date();
const DEFAULT_FROM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
const DEFAULT_TO   = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString().split("T")[0];
const DEFAULT_CATEGORY_TYPE = "expense";

export default function UserDashboard() {
    // Filter state
    const [from,         setFrom]         = useState(DEFAULT_FROM);
    const [to,           setTo]           = useState(DEFAULT_TO);
    const [categoryType, setCategoryType] = useState(DEFAULT_CATEGORY_TYPE);

    // Pending filter state (applied only on click)
    const [pendingFrom,         setPendingFrom]         = useState(DEFAULT_FROM);
    const [pendingTo,           setPendingTo]           = useState(DEFAULT_TO);
    const [pendingCategoryType, setPendingCategoryType] = useState(DEFAULT_CATEGORY_TYPE);

    // Data state
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const isFiltered =
        from !== DEFAULT_FROM ||
        to   !== DEFAULT_TO   ||
        categoryType !== DEFAULT_CATEGORY_TYPE;

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

    // Initial load
    useEffect(() => {
        fetchData({ from, to, categoryType });
    }, []);

    const handleApply = () => {
        setFrom(pendingFrom);
        setTo(pendingTo);
        setCategoryType(pendingCategoryType);
        fetchData({
            from:         pendingFrom,
            to:           pendingTo,
            categoryType: pendingCategoryType,
        });
    };

    const handleReset = () => {
        setPendingFrom(DEFAULT_FROM);
        setPendingTo(DEFAULT_TO);
        setPendingCategoryType(DEFAULT_CATEGORY_TYPE);
        setFrom(DEFAULT_FROM);
        setTo(DEFAULT_TO);
        setCategoryType(DEFAULT_CATEGORY_TYPE);
        fetchData({
            from:         DEFAULT_FROM,
            to:           DEFAULT_TO,
            categoryType: DEFAULT_CATEGORY_TYPE,
        });
    };

    // ── Derived display values ──────────────────────────────────────────
    const totalBalance  = data ? formatCurrency(data.total_balance)  : "—";
    const periodIncome  = data ? formatCurrency(data.period_income)  : "—";
    const periodExpense = data ? formatCurrency(data.period_expense) : "—";
    const netSavings    = data ? formatCurrency(Math.abs(data.net_savings)) : "—";
    const netPositive   = data ? data.net_savings >= 0 : true;

    // Multi-currency warning — if accounts have different currencies
    const hasMixedCurrencies = data
        ? new Set(data.accounts.map((a) => a.currency_code)).size > 1
        : false;

    return (
        <main className="animate-fade-in">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-skin-text">Dashboard</h1>
                    <p className="text-skin-text-muted text-sm mt-0.5">
                        Your financial overview for the selected period
                    </p>
                </div>
            </div>

            {/* Mixed currency warning */}
            {hasMixedCurrencies && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl
                                bg-yellow-500/10 border border-yellow-500/20">
                    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-yellow-500 text-xs">
                        Your accounts use different currencies. Total balance is a raw sum — treat it as approximate.
                    </p>
                </div>
            )}

            {/* Filters */}
            <DashboardFilters
                from={pendingFrom}
                to={pendingTo}
                categoryType={pendingCategoryType}
                onFromChange={setPendingFrom}
                onToChange={setPendingTo}
                onCategoryTypeChange={setPendingCategoryType}
                onApply={handleApply}
                onReset={handleReset}
                isFiltered={isFiltered}
            />

            {/* Global loading */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Global error */}
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
                        onClick={() => fetchData({ from, to, categoryType })}
                        className="mt-4 text-emerald-500 text-sm hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Dashboard content */}
            {!loading && !error && data && (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <DashboardStatCard
                            label="Total Balance"
                            value={totalBalance}
                            sub={`Across ${data.accounts.length} account${data.accounts.length !== 1 ? "s" : ""}`}
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
                            sub="Total earned this period"
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
                            sub="Total spent this period"
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

                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <DashboardBarChart  data={data.monthly_totals} />
                        <DashboardDonutChart
                            data={data.category_totals}
                            categoryType={data.category_type}
                        />
                    </div>

                    {/* Goals + Recent Transactions row */}
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