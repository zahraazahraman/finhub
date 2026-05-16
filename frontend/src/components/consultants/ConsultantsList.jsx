import { useState, useEffect } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import ConsultantCard from "./ConsultantCard.jsx";
import NeedsAnalysis from "./NeedsAnalysis.jsx";
import Spinner from "../ui/Spinner.jsx";

export default function ConsultantsList({ onSelect, needsState, onNeedsMatch, onNeedsReset }) {
  const [allConsultants, setAllConsultants] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    UserConsultantsBLL.getAll(null).then((result) => {
      if (result.success) setAllConsultants(result.consultants);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Spinner size="lg" />
    </div>
  );

  // ── Needs Analysis gate ──
  if (!needsState.done) {
    return (
      <NeedsAnalysis
        onMatch={(situation, consultants) => {
          const ids = consultants.map((c) => c.consultant_id);
          onNeedsMatch(situation, ids);
        }}
        onBrowseAll={() => onNeedsMatch("", [])}
      />
    );
  }

  // ── Filtered results ──
  const displayed =
    needsState.matchedIds.length > 0
      ? allConsultants.filter((c) => needsState.matchedIds.includes(c.consultant_id))
      : allConsultants;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Matched-for header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          {needsState.situation ? (
            <>
              <p className="text-xs font-medium text-skin-text-muted uppercase tracking-wider">Matched for</p>
              <p className="text-sm font-semibold text-skin-text leading-snug">{needsState.situation}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-skin-text">All consultants</p>
          )}
        </div>
        <button
          onClick={onNeedsReset}
          className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline underline-offset-2 transition-colors flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Change
        </button>
      </div>

      {/* ── Consultant grid ── */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-12 h-12 text-skin-text-muted mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p className="text-skin-text font-medium">No consultants found</p>
          <p className="text-skin-text-secondary text-sm mt-1">
            Try browsing all consultants instead.
          </p>
          <button
            onClick={onNeedsReset}
            className="mt-4 text-sm text-brand hover:underline underline-offset-2 transition-colors"
          >
            Start over
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((c) => (
            <ConsultantCard key={c.consultant_id} consultant={c} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
