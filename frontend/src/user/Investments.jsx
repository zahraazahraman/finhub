import { useState, useEffect } from "react";
import InvestmentsBLL from "../bll/InvestmentsBLL.js";
import CurrenciesBLL from "../bll/CurrenciesBLL.js";
import Spinner from "../components/ui/Spinner.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import InvestmentsList from "../components/investments/InvestmentsList.jsx";
import InvestmentDetail from "../components/investments/InvestmentDetail.jsx";
import AddInvestmentModal from "../components/investments/AddInvestmentModal.jsx";
import AIAnalysisModal from "../components/investments/AIAnalysisModal.jsx";
import UpdatePriceModal from "../components/investments/UpdatePriceModal.jsx";

export default function Investments() {
  // ── Data ──
  const [investments, setInvestments] = useState([]);
  const [currencies, setCurrencies]   = useState([]);

  // ── View ──
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // ── Loading ──
  const [pageLoading, setPageLoading] = useState(true);

  // ── Modals ──
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [deleteTarget, setDeleteTarget]           = useState(null);
  const [showAnalysis, setShowAnalysis]           = useState(false);
  const [showUpdatePrice, setShowUpdatePrice]     = useState(false);

  // ── AI analysis state ──
  const [analysis, setAnalysis]               = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError]     = useState("");

  // ── Action loading ──
  const [deleting, setDeleting] = useState(false);

  // ── Load on mount ──
  useEffect(() => {
    const load = async () => {
      const [invResult, curResult] = await Promise.all([
        InvestmentsBLL.getAll(),
        CurrenciesBLL.getAll(),
      ]);

      let loadedInvestments = [];
      if (invResult.success) loadedInvestments = invResult.investments;
      if (curResult.success) setCurrencies(curResult.currencies);

      setInvestments(loadedInvestments);
      setPageLoading(false);

      // ── Silently refresh live prices for stock + crypto ──
      const hasAutoTracked = loadedInvestments.some(
        (i) => (i.investment_type === "stock" || i.investment_type === "crypto") && i.symbol
      );

      if (hasAutoTracked) {
        const priceResult = await InvestmentsBLL.updatePrices();
        if (priceResult.success && priceResult.updated.length > 0) {
          setInvestments((prev) =>
            prev.map((inv) => {
              const updated = priceResult.updated.find(
                (u) => u.investment_id === inv.investment_id
              );
              return updated
                ? { ...inv, current_price: updated.current_price }
                : inv;
            })
          );
        }
      }
    };
    load();
  }, []);

  // ── Keep selectedInvestment in sync when investments state updates ──
  // (so detail view reflects fresh prices without needing a re-click)
  useEffect(() => {
    if (!selectedInvestment) return;
    const fresh = investments.find(
      (i) => i.investment_id === selectedInvestment.investment_id
    );
    if (fresh) setSelectedInvestment(fresh);
  }, [investments]);

  // ── Handlers ──
  const handleCreated = async (newInvestment) => {
    setInvestments((prev) => [newInvestment, ...prev]);
    setShowAddInvestment(false);

    // Immediately fetch live price for new stock/crypto investments
    const shouldAutoFetch =
      (newInvestment.investment_type === "stock" || newInvestment.investment_type === "crypto")
      && newInvestment.symbol;

    if (shouldAutoFetch) {
      const priceResult = await InvestmentsBLL.updatePrices();
      if (priceResult.success && priceResult.updated.length > 0) {
        setInvestments((prev) =>
          prev.map((inv) => {
            const updated = priceResult.updated.find(
              (u) => u.investment_id === inv.investment_id
            );
            return updated ? { ...inv, current_price: updated.current_price } : inv;
          })
        );
      }
    }
  };

  const handleDeleted = async () => {
    setDeleting(true);
    const result = await InvestmentsBLL.remove(deleteTarget.investment_id);
    if (result.success) {
      setInvestments((prev) => prev.filter(i => i.investment_id !== deleteTarget.investment_id));
      setDeleteTarget(null);
      if (selectedInvestment?.investment_id === deleteTarget.investment_id)
        setSelectedInvestment(null);
    }
    setDeleting(false);
  };

  // Called by UpdatePriceModal on success
  const handlePriceUpdated = (investmentId, newPrice) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.investment_id === investmentId
          ? { ...inv, current_price: newPrice }
          : inv
      )
    );
    setShowUpdatePrice(false);
  };

  const handleAnalyze = async () => {
    setShowAnalysis(true);
    setAnalysis(null);
    setAnalysisError("");
    setAnalysisLoading(true);
    const result = await InvestmentsBLL.analyze();
    if (result.success) setAnalysis(result.analysis);
    else setAnalysisError(result.error);
    setAnalysisLoading(false);
  };

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64 animate-fade-in">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      {!selectedInvestment && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-skin-text">My Investments</h1>
            <p className="text-skin-text-secondary text-sm mt-1">
              Track your stocks, crypto, and real estate portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {investments.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleAnalyze}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                }
                iconPosition="left"
              >
                AI Analysis
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setShowAddInvestment(true)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
              iconPosition="left"
            >
              Add Investment
            </Button>
          </div>
        </div>
      )}

      {/* ── View ── */}
      {!selectedInvestment ? (
        <InvestmentsList
          investments={investments}
          onSelectInvestment={(inv) => setSelectedInvestment(inv)}
          onAddInvestment={() => setShowAddInvestment(true)}
          onDeleteInvestment={setDeleteTarget}
        />
      ) : (
        <InvestmentDetail
          investment={selectedInvestment}
          analysis={analysis}
          onBack={() => setSelectedInvestment(null)}
          onDelete={setDeleteTarget}
          onUpdatePrice={() => setShowUpdatePrice(true)}
        />
      )}

      {/* ── Modals ── */}
      {showAddInvestment && (
        <AddInvestmentModal
          currencies={currencies}
          onClose={() => setShowAddInvestment(false)}
          onCreated={handleCreated}
        />
      )}

      {showAnalysis && (
        <AIAnalysisModal
          analysis={analysis}
          loading={analysisLoading}
          error={analysisError}
          investments={investments}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {showUpdatePrice && selectedInvestment && (
        <UpdatePriceModal
          investment={selectedInvestment}
          onClose={() => setShowUpdatePrice(false)}
          onUpdated={handlePriceUpdated}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Delete Investment?"
          description={`This will permanently delete "${deleteTarget.investment_name}" from your portfolio.`}
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDeleted}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}