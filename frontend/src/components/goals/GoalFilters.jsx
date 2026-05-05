import { useMemo } from "react";

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "saving", label: "Saving" },
  { value: "debt_repayment", label: "Debt Repayment" },
];

const STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "no_deadline", label: "No Deadline" },
];

export default function GoalFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  stateFilter,
  onStateFilterChange,
  onReset,
  hasActiveFilters,
  visibleCount,
  totalCount,
}) {
  const showingLabel = useMemo(() => {
    if (totalCount === 0) return "No goals yet";
    if (visibleCount === totalCount) return `Showing all ${totalCount}`;
    return `Showing ${visibleCount} of ${totalCount}`;
  }, [visibleCount, totalCount]);

  return (
    <div className="mb-6 rounded-xl border border-skin-border bg-skin-secondary/40 p-3 sm:p-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem] lg:items-end">
        <div>
          <label htmlFor="goal-search" className="block text-xs font-medium text-skin-text-muted mb-1.5">
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-skin-text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="goal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search goals by name..."
              className="w-full rounded-lg border border-skin-border bg-skin-bg py-2 pl-9 pr-10 text-sm text-skin-text placeholder:text-skin-text-muted focus:border-emerald-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-3 flex items-center text-skin-text-muted hover:text-skin-text"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="goal-type-filter" className="block text-xs font-medium text-skin-text-muted mb-1.5">
            Goal Type
          </label>
          <select
            id="goal-type-filter"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="goal-state-filter" className="block text-xs font-medium text-skin-text-muted mb-1.5">
            Goal State
          </label>
          <select
            id="goal-state-filter"
            value={stateFilter}
            onChange={(e) => onStateFilterChange(e.target.value)}
            className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
          >
            {STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-skin-text-muted">{showingLabel}</p>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="text-xs font-medium text-emerald-500 hover:text-emerald-400 disabled:text-skin-text-muted disabled:hover:text-skin-text-muted disabled:cursor-not-allowed transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
