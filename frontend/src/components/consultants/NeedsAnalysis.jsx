import { useState } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import Spinner from "../ui/Spinner.jsx";

// ── Situation option icons (inline SVGs, 20×20) ──

const DebtIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

const InvestIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const BudgetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const CustomIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const SITUATIONS = [
  { id: "debt",   label: "I have debt I can't manage",           icon: <DebtIcon /> },
  { id: "invest", label: "I want to start or improve investing",  icon: <InvestIcon /> },
  { id: "save",   label: "I'm trying to save for something",     icon: <SaveIcon /> },
  { id: "budget", label: "I don't know where my money goes",     icon: <BudgetIcon /> },
];

export default function NeedsAnalysis({ onMatch, onBrowseAll }) {
  const [loadingId,    setLoadingId]    = useState(null);
  const [showCustom,   setShowCustom]   = useState(false);
  const [customText,   setCustomText]   = useState("");
  const [error,        setError]        = useState("");

  const runMatch = async (id, text) => {
    setError("");
    setLoadingId(id);
    const result = await UserConsultantsBLL.matchByNeed(text);
    setLoadingId(null);
    if (result.success) {
      onMatch(text, result.consultants);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  const handlePreset = (situation) => {
    if (loadingId) return;
    if (situation.id === "custom") {
      setShowCustom(true);
      return;
    }
    runMatch(situation.id, situation.label);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const text = customText.trim();
    if (!text) return;
    runMatch("custom", text);
  };

  const isDisabled = loadingId !== null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-skin-text">What do you need help with?</h2>
        <p className="text-sm text-skin-text-secondary">
          Select what fits best — we'll match you with the right expert.
        </p>
      </div>

      {/* ── Preset situation cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SITUATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => handlePreset(s)}
            disabled={isDisabled}
            className={`
              group flex items-center gap-4 p-4 rounded-2xl border-2 text-left
              bg-skin-card border-skin-border
              hover:border-brand hover:bg-skin-hover
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          >
            <div className="w-10 h-10 rounded-xl bg-skin-brand-subtle flex items-center justify-center flex-shrink-0 text-brand group-hover:scale-110 transition-transform duration-200">
              {s.icon}
            </div>
            <span className="text-sm font-medium text-skin-text leading-snug">
              {s.label}
            </span>
            {loadingId === s.id && (
              <Spinner size="sm" className="ml-auto flex-shrink-0" />
            )}
          </button>
        ))}

        {/* ── Custom option (full-width) ── */}
        {!showCustom ? (
          <button
            onClick={() => { if (!isDisabled) setShowCustom(true); }}
            disabled={isDisabled}
            className="sm:col-span-2 group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-skin-border text-left hover:border-brand hover:bg-skin-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-skin-hover flex items-center justify-center flex-shrink-0 text-skin-text-muted group-hover:text-brand group-hover:bg-skin-brand-subtle transition-all duration-200">
              <CustomIcon />
            </div>
            <span className="text-sm font-medium text-skin-text-secondary group-hover:text-skin-text leading-snug">
              Let me describe my situation
            </span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="sm:col-span-2 flex flex-col gap-3 p-4 rounded-2xl border-2 border-brand bg-skin-brand-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-skin-card flex items-center justify-center flex-shrink-0 text-brand">
                <CustomIcon />
              </div>
              <p className="text-sm font-medium text-skin-text">Describe your situation</p>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. I have a mortgage and two credit cards and I'm struggling to keep up…"
              rows={3}
              disabled={isDisabled}
              className="w-full bg-skin-card border border-skin-border rounded-xl px-4 py-2.5 text-sm text-skin-text placeholder-skin-text-muted resize-none outline-none focus:ring-2 focus:ring-[var(--brand-subtle)] focus:border-brand transition-all disabled:opacity-50"
            />
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setShowCustom(false); setCustomText(""); }}
                disabled={isDisabled}
                className="text-xs text-skin-text-muted hover:text-skin-text transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={!customText.trim() || isDisabled}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
              >
                {loadingId === "custom" && <Spinner size="sm" />}
                Find consultants
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* ── Browse all shortcut ── */}
      <div className="flex items-center justify-center">
        <button
          onClick={onBrowseAll}
          disabled={isDisabled}
          className="text-sm text-skin-text-muted hover:text-skin-text underline underline-offset-2 transition-colors disabled:opacity-50"
        >
          Browse all consultants instead
        </button>
      </div>
    </div>
  );
}
