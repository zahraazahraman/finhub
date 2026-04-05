import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { formatCurrency } from "../../utils/formatters.js";

const ACCOUNT_TYPE_STYLES = {
  bank:        { label: "Bank",        variant: "info"    },
  cash:        { label: "Cash",        variant: "success" },
  credit_card: { label: "Credit Card", variant: "warning" },
  wallet:      { label: "Wallet",      variant: "purple"  },
};

const ACCOUNT_ICONS = {
  bank: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
    </svg>
  ),
  cash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  credit_card: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  ),
  wallet: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 3H8L4 7h16l-4-4z" />
      <circle cx="17" cy="13" r="1" />
    </svg>
  ),
};

export default function AccountCard({ account, onSelect, onDelete }) {
  const typeStyle = ACCOUNT_TYPE_STYLES[account.account_type] ?? { label: account.account_type, variant: "default" };
  const icon      = ACCOUNT_ICONS[account.account_type];

  return (
    <Card hover padding="md" className="cursor-pointer group relative">
      {/* ── Delete button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(account); }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity
                   text-skin-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {/* ── Clickable area ── */}
      <div onClick={() => onSelect(account)}>
        {/* Icon + type */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                          flex items-center justify-center text-emerald-500">
            {icon}
          </div>
          <Badge variant={typeStyle.variant}>{typeStyle.label}</Badge>
        </div>

        {/* Name */}
        <p className="text-skin-text font-semibold text-base mb-1 truncate pr-6">
          {account.account_name}
        </p>

        {/* Balance */}
        <p className="text-2xl font-bold text-skin-text mt-3">
          {account.currency_symbol}{formatCurrency(account.balance)}
        </p>
        <p className="text-skin-text-muted text-xs mt-1">{account.currency_code}</p>
      </div>
    </Card>
  );
}