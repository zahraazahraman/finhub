import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Spinner from "../ui/Spinner.jsx";

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

export default function AIAnalysisModal({ analysis, loading, error, investments, onClose }) {
  return (
    <Modal
      title="AI Portfolio Analysis"
      description="Powered by Groq AI — recommendations based on your current portfolio data."
      onClose={onClose}
      size="xl"
    >
      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Spinner size="lg" />
          <p className="text-skin-text-muted text-sm">Analyzing your portfolio...</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <p className="text-red-500 text-sm text-center">{error}</p>
        </div>
      )}

      {/* ── Results: 2-column on sm+, 1-column on mobile ── */}
      {!loading && !error && analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-4">

          {/* ── Left column: summary + diversification ── */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-skin-secondary border border-skin-border">
              <p className="text-skin-text-muted text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Portfolio Summary
              </p>
              <p className="text-skin-text text-sm leading-relaxed">{analysis.portfolio_summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-skin-secondary border border-skin-border">
              <p className="text-skin-text-muted text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Diversification
              </p>
              <p className="text-skin-text text-sm leading-relaxed">{analysis.diversification_note}</p>
            </div>
          </div>

          {/* ── Right column: per-investment recommendations ── */}
          <div>
            <p className="text-skin-text-muted text-xs font-semibold mb-3 uppercase tracking-wide">
              Recommendations
            </p>
            <div className="space-y-3">
              {analysis.investments.map((item) => {
                const inv  = investments.find((i) => i.investment_id === item.investment_id);
                const rec  = RECOMMENDATION_CONFIG[item.recommendation];
                const risk = RISK_CONFIG[item.risk_level];

                return (
                  <div
                    key={item.investment_id}
                    className="p-4 rounded-xl border border-skin-border"
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-skin-text font-semibold text-sm">
                          {inv?.investment_name ?? "Investment"}
                        </p>
                        {inv?.symbol && (
                          <p className="text-skin-text-muted text-xs font-mono">{inv.symbol}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {rec  && <Badge variant={rec.variant}  size="sm">{rec.label}</Badge>}
                        {risk && <Badge variant={risk.variant} size="sm">{risk.label}</Badge>}
                      </div>
                    </div>
                    <p className="text-skin-text-secondary text-sm leading-relaxed">
                      {item.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
}