import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Table from "../ui/Table.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const TX_TYPE_STYLES = {
  income:   { label: "Income",   variant: "success" },
  expense:  { label: "Expense",  variant: "danger"  },
  transfer: { label: "Transfer", variant: "info"    },
};

export default function AccountDetail({ account, transactions, loading, onBack, onAddTx, onImport, onScanReceipt, onDeleteTx, onDeleteAccount }) {
  const totalIncome   = transactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  const columns = [
    {
      key: "transaction_date",
      label: "Date",
      render: (row) => (
        <span className="text-skin-text-secondary text-sm">{formatDate(row.transaction_date)}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-skin-text text-sm">{row.description || "—"}</span>
      ),
    },
    {
      key: "category_name",
      label: "Category",
      render: (row) => (
        <span className="text-skin-text-secondary text-sm">{row.category_name || "—"}</span>
      ),
    },
    {
      key: "transaction_type",
      label: "Type",
      render: (row) => {
        const style = TX_TYPE_STYLES[row.transaction_type] ?? { label: row.transaction_type, variant: "default" };
        return <Badge variant={style.variant}>{style.label}</Badge>;
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (
        <span className={`font-semibold text-sm ${
          row.transaction_type === "income" ? "text-emerald-500" : "text-red-500"
        }`}>
          {row.transaction_type === "income" ? "+" : "-"}
          {account.currency_symbol}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={() => onDeleteTx(row)}
          className="text-skin-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-skin-text-muted hover:text-skin-text p-1.5 rounded-lg
                       hover:bg-skin-hover transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-skin-text">{account.account_name}</h1>
            <p className="text-skin-text-muted text-sm">{account.currency_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteAccount(account)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            }
            iconPosition="left"
          >
            Delete Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
            iconPosition="left"
          >
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onScanReceipt}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            }
            iconPosition="left"
          >
            Scan Receipt
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddTx}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            iconPosition="left"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Balance",        value: account.balance,  color: "text-skin-text",   prefix: account.currency_symbol },
          { label: "Total Income",   value: totalIncome,      color: "text-emerald-500", prefix: account.currency_symbol },
          { label: "Total Expenses", value: totalExpenses,    color: "text-red-500",     prefix: account.currency_symbol },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-skin-card border border-skin-border rounded-2xl p-5 animate-slide-up"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <p className="text-skin-text-muted text-xs font-medium uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.prefix}{formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Transactions table ── */}
      <Table
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transactions yet. Add your first one."
      />
    </div>
  );
}
