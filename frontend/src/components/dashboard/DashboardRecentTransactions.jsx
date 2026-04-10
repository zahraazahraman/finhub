import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Spinner from "../ui/Spinner.jsx";
import { formatDate, formatCurrency } from "../../utils/formatters.js";

const TYPE_STYLES = {
    income:   { variant: "success", label: "Income"   },
    expense:  { variant: "danger",  label: "Expense"  },
    transfer: { variant: "info",    label: "Transfer" },
};

const SOURCE_STYLES = {
    manual:  { variant: "default", label: "Manual"  },
    csv:     { variant: "purple",  label: "Import"  },
    receipt: { variant: "orange",  label: "Receipt" },
};

const ACCOUNT_TYPE_ICONS = {
    bank: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="10" width="18" height="11" rx="2"/>
            <path d="M3 10l9-7 9 7"/>
        </svg>
    ),
    cash: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    credit_card: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
    ),
    wallet: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
            <circle cx="17" cy="12" r="1"/>
        </svg>
    ),
};

function TransactionRow({ tx }) {
    const typeStyle   = TYPE_STYLES[tx.transaction_type]   ?? TYPE_STYLES.expense;
    const sourceStyle = SOURCE_STYLES[tx.source_type]      ?? SOURCE_STYLES.manual;
    const isIncome    = tx.transaction_type === "income";
    const isTransfer  = tx.transaction_type === "transfer";

    return (
        <div className="flex items-center gap-3 py-3.5 border-b border-skin-border last:border-0">
            {/* Type indicator dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isIncome   ? "bg-emerald-500" :
                isTransfer ? "bg-blue-500"    : "bg-red-500"
            }`} />

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-skin-text text-sm font-medium truncate">
                        {tx.description || tx.category_name}
                    </p>
                    <Badge variant={sourceStyle.variant} size="sm">
                        {sourceStyle.label}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-skin-text-muted text-xs">
                    <span className="flex items-center gap-1">
                        {ACCOUNT_TYPE_ICONS[tx.account_type]}
                        {tx.account_name}
                    </span>
                    <span>·</span>
                    <span>{tx.category_name}</span>
                    <span>·</span>
                    <span>{formatDate(tx.transaction_date)}</span>
                </div>
            </div>

            {/* Amount + type badge */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-sm font-semibold ${
                    isIncome   ? "text-emerald-500" :
                    isTransfer ? "text-blue-500"    : "text-red-500"
                }`}>
                    {isIncome ? "+" : isTransfer ? "" : "−"}
                    {formatCurrency(tx.amount, tx.currency_symbol ?? "$")}
                </span>
                <Badge variant={typeStyle.variant} size="sm">
                    {typeStyle.label}
                </Badge>
            </div>
        </div>
    );
}

export default function DashboardRecentTransactions({ transactions = [], loading = false }) {
    return (
        <Card padding="md">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-skin-text font-semibold">Recent Transactions</h2>
                    <p className="text-skin-text-muted text-xs mt-0.5">
                        Last {transactions.length} transactions in the selected period
                    </p>
                </div>
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center
                                bg-blue-500/10 border-blue-500/20 text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 1l4 4-4 4"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <path d="M7 23l-4-4 4-4"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                </div>
            </div>

            {/* Scrollable list */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="md" />
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-skin-hover border border-skin-border
                                    flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <p className="text-skin-text-muted text-sm">No transactions found.</p>
                    <p className="text-skin-text-muted text-xs mt-0.5">
                        Try adjusting the date range or category filter.
                    </p>
                </div>
            ) : (
                <div className="max-h-80 overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                        <TransactionRow key={tx.transaction_id} tx={tx} />
                    ))}
                </div>
            )}
        </Card>
    );
}