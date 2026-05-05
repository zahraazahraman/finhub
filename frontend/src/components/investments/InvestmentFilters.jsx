import { useMemo } from "react";

const TIME_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Crypto" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

export const DEFAULT_TIME_FILTER = "all";

export default function InvestmentFilters({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  typeFilter,
  onTypeFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  onReset,
  hasActiveFilters,
  visibleCount,
  totalCount,
}) {
  const showingLabel = useMemo(() => {
    if (totalCount === 0) return "No investments yet";
    if (visibleCount === totalCount) return `Showing all ${totalCount}`;
    return `Showing ${visibleCount} of ${totalCount}`;
  }, [visibleCount, totalCount]);

  return (
    <div className="mb-6 rounded-xl border border-skin-border bg-skin-secondary/40 p-3 sm:p-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_14rem] lg:items-end">
        <div className="flex-1">
          <label htmlFor="investment-search" className="block text-xs font-medium text-skin-text-muted mb-1.5">
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
              id="investment-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, symbol, or notes..."
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
          <label htmlFor="investment-time-filter" className="block text-xs font-medium text-skin-text-muted mb-1.5">
            Investment Time
          </label>
          <select
            id="investment-time-filter"
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
          >
            {TIME_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="investment-type-filter" className="block text-xs font-medium text-skin-text-muted mb-1.5">
            Investment Type
          </label>
          <select
            id="investment-type-filter"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
          >
            {TYPE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {timeFilter === "custom" && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="investment-from-date" className="block text-xs font-medium text-skin-text-muted mb-1.5">
              From
            </label>
            <input
              id="investment-from-date"
              type="date"
              value={customDateRange.from}
              onChange={(e) => onCustomDateRangeChange({ ...customDateRange, from: e.target.value })}
              className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="investment-to-date" className="block text-xs font-medium text-skin-text-muted mb-1.5">
              To
            </label>
            <input
              id="investment-to-date"
              type="date"
              value={customDateRange.to}
              onChange={(e) => onCustomDateRangeChange({ ...customDateRange, to: e.target.value })}
              className="w-full rounded-lg border border-skin-border bg-skin-bg px-3 py-2 text-sm text-skin-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

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
