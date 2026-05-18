import { useState } from "react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Spinner from "../ui/Spinner.jsx";

const TYPE_CONFIG = {
  stock:       { label: "Stock",       variant: "info"    },
  crypto:      { label: "Crypto",      variant: "purple"  },
  real_estate: { label: "Real Estate", variant: "orange"  },
  other:       { label: "Other",       variant: "default" },
};

const RECOMMENDATION_CONFIG = {
  buy:  { label: "Buy",  variant: "success" },
  hold: { label: "Hold", variant: "warning" },
  sell: { label: "Sell", variant: "danger"  },
};

const RISK_CONFIG = {
  low:    { label: "Low Risk",    variant: "success" },
  medium: { label: "Medium Risk", variant: "warning" },
  high:   { label: "High Risk",   variant: "danger"  },
};

function computeMetrics(inv) {
  const qty          = parseFloat(inv.quantity);
  const buyPrice     = parseFloat(inv.purchase_price);
  const rawCur       = parseFloat(inv.current_price);
  const curPrice     = (!isNaN(rawCur) && rawCur > 0) ? rawCur : buyPrice;
  const costBasis    = qty * buyPrice;
  const currentValue = qty * curPrice;
  const profitLoss   = currentValue - costBasis;
  const roi          = buyPrice > 0 ? ((curPrice - buyPrice) / buyPrice) * 100 : 0;
  return { qty, buyPrice, curPrice, costBasis, currentValue, profitLoss, roi };
}

function StatCard({ label, value, highlight, infoText }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-skin-text-muted text-xs">{label}</p>

        {infoText && (
          // This wrapper is relative so the tooltip is anchored to the button,
          // not to the card — preventing overlap with cards below.
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              onBlur={() => setShowInfo(false)}
              className="w-4 h-4 rounded-full border border-skin-border text-skin-text-muted
                         text-[10px] leading-none flex items-center justify-center
                         hover:text-skin-text hover:border-skin-text-muted transition-colors"
              aria-label={`Explain ${label}`}
              aria-expanded={showInfo}
            >
              ?
            </button>

            {showInfo && (
              <div
                className="
                  absolute z-20 w-64 rounded-xl border border-skin-border p-3 shadow-xl
                  bottom-full mb-2 right-0
                "
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <p className="text-skin-text-secondary text-xs leading-relaxed">
                  {infoText}
                </p>
                {/* Downward pointing arrow */}
                <div
                  className="absolute -bottom-[5px] right-3 w-2.5 h-2.5 rotate-45 border-r border-b border-skin-border"
                  style={{ backgroundColor: "var(--bg-card)" }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <p className={`text-lg font-bold ${highlight ?? "text-skin-text"}`}>{value}</p>
    </Card>
  );
}

const isAutoTracked = (type) => type === "stock" || type === "crypto";

// ── Skeleton shown while analysis is loading ──
function AnalysisSkeleton() {
  return (
    <Card padding="md" className="animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded bg-skin-hover" />
        <div className="h-4 w-36 rounded bg-skin-hover" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 rounded-full bg-skin-hover" />
        <div className="h-6 w-20 rounded-full bg-skin-hover" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-skin-hover" />
        <div className="h-3 w-5/6 rounded bg-skin-hover" />
        <div className="h-3 w-4/6 rounded bg-skin-hover" />
      </div>
    </Card>
  );
}

// ── Full analysis panel ──
function AnalysisPanel({ analysis }) {
  const rec  = RECOMMENDATION_CONFIG[analysis.recommendation];
  const risk = RISK_CONFIG[analysis.risk_level];

  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        <h3 className="text-skin-text font-semibold text-sm">AI Analysis</h3>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-5">
        {rec  && <Badge variant={rec.variant}  size="md">{rec.label}</Badge>}
        {risk && <Badge variant={risk.variant} size="sm">{risk.label}</Badge>}
      </div>

      {/* 2-column grid on sm+, 1-column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        <div>
          <p className="text-skin-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">
            Performance
          </p>
          <p className="text-skin-text-secondary text-sm leading-relaxed">
            {analysis.performance_summary}
          </p>
        </div>

        <div>
          <p className="text-skin-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">
            Market Context
          </p>
          <p className="text-skin-text-secondary text-sm leading-relaxed">
            {analysis.market_context}
          </p>
        </div>

        <div>
          <p className="text-skin-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">
            Action Advice
          </p>
          <p className="text-skin-text-secondary text-sm leading-relaxed">
            {analysis.action_advice}
          </p>
        </div>

        <div>
          <p className="text-skin-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">
            Key Factors
          </p>
          <ul className="space-y-1">
            {(analysis.key_factors ?? []).map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-skin-text-secondary">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </Card>
  );
}

export default function InvestmentDetail({
  investment,
  onBack,
  onDelete,
  onUpdatePrice,
  onAnalyze,
  analysisState,
}) {
  const typeConfig = TYPE_CONFIG[investment.investment_type] || TYPE_CONFIG.other;
  const { qty, buyPrice, curPrice, costBasis, currentValue, profitLoss, roi } = computeMetrics(investment);
  const isPositive = profitLoss >= 0;
  const sym        = investment.currency_symbol ?? "";

  const fmt = (n) =>
    sym + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isAnalyzing = analysisState?.loading ?? false;

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-skin-text-muted hover:text-skin-text transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold text-skin-text">{investment.investment_name}</h1>
              {investment.symbol && (
                <span className="text-skin-text-muted font-mono text-sm">({investment.symbol})</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={typeConfig.variant} size="sm">{typeConfig.label}</Badge>
              {isAutoTracked(investment.investment_type) && (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Live price
                </span>
              )}
              <span className="text-skin-text-muted text-xs">
                Purchased{" "}
                {new Date(investment.purchase_date).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAnalyze}
            loading={isAnalyzing}
            icon={
              !isAnalyzing && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              )
            }
            iconPosition="left"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>

          {!isAutoTracked(investment.investment_type) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onUpdatePrice}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              }
              iconPosition="left"
            >
              Update Price
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(investment)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            }
            iconPosition="left"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Current Value" value={fmt(currentValue)} />
        <StatCard label="Cost Basis"    value={fmt(costBasis)}    />
        <StatCard
          label="Profit / Loss"
          value={(isPositive ? "+" : "") + fmt(profitLoss)}
          highlight={isPositive ? "text-emerald-500" : "text-red-500"}
        />
        <StatCard
          label="ROI"
          value={(isPositive ? "+" : "") + roi.toFixed(2) + "%"}
          highlight={isPositive ? "text-emerald-500" : "text-red-500"}
          infoText="ROI (Return on Investment) shows how much your investment gained or lost relative to the purchase price. Calculated as: ((current price − purchase price) ÷ purchase price) × 100."
        />
      </div>

      {/* ── Details + Notes ── */}
      <div className={`grid grid-cols-1 ${investment.notes ? "sm:grid-cols-2" : ""} gap-4 mb-6`}>
        <Card padding="md">
          <h3 className="text-skin-text font-semibold text-sm mb-3">Investment Details</h3>
          <div className="space-y-2.5">
            {[
              { label: "Quantity",       value: parseFloat(qty).toLocaleString() },
              { label: "Purchase Price", value: fmt(buyPrice)                     },
              {
                label: "Current Price",
                value: investment.current_price != null ? fmt(curPrice) : "Not set",
              },
              { label: "Currency", value: investment.currency_code },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-skin-text-muted">{label}</span>
                <span className="text-skin-text font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {investment.notes && (
          <Card padding="md">
            <h3 className="text-skin-text font-semibold text-sm mb-2">Notes</h3>
            <p className="text-skin-text-secondary text-sm leading-relaxed">{investment.notes}</p>
          </Card>
        )}
      </div>

      {/* ── Inline AI Analysis ── */}
      {analysisState?.loading && <AnalysisSkeleton />}

      {!analysisState?.loading && analysisState?.error && (
        <Card padding="md">
          <p className="text-red-500 text-sm text-center">{analysisState.error}</p>
        </Card>
      )}

      {!analysisState?.loading && analysisState?.data && (
        <AnalysisPanel analysis={analysisState.data} />
      )}

    </div>
  );
}