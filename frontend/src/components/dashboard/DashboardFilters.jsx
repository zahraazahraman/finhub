import Button from "../ui/Button.jsx";
import Select from "../ui/Select.jsx";

const CATEGORY_TYPE_OPTIONS = [
    { value: "expense", label: "Expenses" },
    { value: "income",  label: "Income"   },
];

export default function DashboardFilters({
    from, to, categoryType,
    onFromChange, onToChange, onCategoryTypeChange,
    onApply, onReset,
    isFiltered,
}) {
    return (
        <div className="bg-skin-card border border-skin-border rounded-2xl p-4 flex flex-wrap items-center gap-3 mb-6 animate-slide-up"
             style={{ boxShadow: "var(--shadow-md)" }}>

            {/* Calendar icon + label */}
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8"  y1="2" x2="8"  y2="6" />
                    <line x1="3"  y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-skin-text-secondary text-sm">Date Range:</span>
            </div>

            {/* From */}
            <input
                type="date"
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
                className="bg-skin-input border border-skin-border rounded-xl px-3 py-1.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            />

            <span className="text-skin-text-muted text-sm">to</span>

            {/* To */}
            <input
                type="date"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
                className="bg-skin-input border border-skin-border rounded-xl px-3 py-1.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            />

            {/* Divider */}
            <div className="w-px h-5 bg-skin-border hidden sm:block" />

            {/* Category type toggle — for donut chart */}
            <div className="flex items-center gap-2">
                <span className="text-skin-text-secondary text-sm">Category View:</span>
                <Select
                    value={categoryType}
                    onChange={(e) => onCategoryTypeChange(e.target.value)}
                    options={CATEGORY_TYPE_OPTIONS}
                    className="w-36"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
                {isFiltered && (
                    <Button variant="secondary" size="sm" onClick={onReset}>
                        Reset
                    </Button>
                )}
                <Button variant="primary" size="sm" onClick={onApply}>
                    Apply
                </Button>
            </div>

            {/* Active filter indicator */}
            {isFiltered && (
                <p className="w-full text-emerald-500 text-xs">
                    Filtered: {from || "—"} → {to || "—"} · {categoryType === "expense" ? "Expenses" : "Income"} breakdown
                </p>
            )}
        </div>
    );
}
