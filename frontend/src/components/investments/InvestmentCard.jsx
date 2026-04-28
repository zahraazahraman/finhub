import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";

const TYPE_CONFIG = {
  stock:       { label: "Stock",       variant: "info"    },
  crypto:      { label: "Crypto",      variant: "purple"  },
  real_estate: { label: "Real Estate", variant: "orange"  },
  other:       { label: "Other",       variant: "default" },
};

function computeMetrics(inv) {
  const qty          = parseFloat(inv.quantity);
  const buyPrice     = parseFloat(inv.purchase_price);
  const rawCur = parseFloat(inv.current_price);
  const curPrice = (!isNaN(rawCur) && rawCur > 0) ? rawCur : buyPrice;
  const costBasis    = qty * buyPrice;
  const currentValue = qty * curPrice;
  const profitLoss   = currentValue - costBasis;
  const roi          = buyPrice > 0 ? ((curPrice - buyPrice) / buyPrice) * 100 : 0;
  return { currentValue, profitLoss, roi };
}

function fmt(sym, n) {
  return sym + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvestmentCard({ investment, onSelect, onDelete }) {
  const typeConfig             = TYPE_CONFIG[investment.investment_type] || TYPE_CONFIG.other;
  const { currentValue, profitLoss, roi } = computeMetrics(investment);
  const isPositive             = profitLoss >= 0;
  const sym                    = investment.currency_symbol ?? "";

  return (
    <Card hover padding="md" className="relative group">

      {/* ── Delete button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(investment); }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                   text-skin-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {/* ── Clickable area ── */}
      <div onClick={() => onSelect(investment)} className="cursor-pointer">

        {/* ── Type badge ── */}
        <div className="mb-3">
          <Badge variant={typeConfig.variant} size="sm">{typeConfig.label}</Badge>
        </div>

        {/* ── Name + symbol ── */}
        <h3 className="text-skin-text font-semibold text-base mb-0.5 pr-6 leading-snug">
          {investment.investment_name}
        </h3>
        {investment.symbol && (
          <p className="text-skin-text-muted text-xs mb-3 font-mono">{investment.symbol}</p>
        )}
        {!investment.symbol && <div className="mb-3" />}

        {/* ── Divider ── */}
        <div className="border-t border-skin-border mb-3" />

        {/* ── Metrics ── */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-skin-text-muted">Current Value</span>
            <span className="text-skin-text font-medium">{fmt(sym, currentValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-skin-text-muted">Profit / Loss</span>
            <span className={`font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{fmt(sym, profitLoss)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-skin-text-muted">ROI</span>
            <span className={`font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{roi.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}