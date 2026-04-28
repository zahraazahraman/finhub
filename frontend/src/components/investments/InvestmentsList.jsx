import InvestmentCard from "./InvestmentCard.jsx";

export default function InvestmentsList({ investments, onSelectInvestment, onAddInvestment, onDeleteInvestment }) {

  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-skin-secondary border border-skin-border flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <h3 className="text-skin-text font-semibold text-base mb-1">No investments yet</h3>
        <p className="text-skin-text-muted text-sm mb-6 text-center max-w-xs">
          Add your first investment and start tracking your portfolio performance.
        </p>
        <button
          onClick={onAddInvestment}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add your first investment
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {investments.map((inv) => (
        <InvestmentCard
          key={inv.investment_id}
          investment={inv}
          onSelect={onSelectInvestment}
          onDelete={onDeleteInvestment}
        />
      ))}
    </div>
  );
}