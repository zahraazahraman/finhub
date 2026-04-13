import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Table from "../ui/Table.jsx";
import Spinner from "../ui/Spinner.jsx";

const GOAL_TYPE_LABELS = {
  saving:         { label: "Saving",         variant: "info"   },
  debt_repayment: { label: "Debt Repayment", variant: "orange" },
};

export default function GoalDetail({
  goal,
  contributions = [],
  loading,
  onBack,
  onAddContribution,
  onDeleteContribution,
  onDeleteGoal,
}) {
  const progress    = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100);
  const isCompleted = progress >= 100;
  const remaining   = Math.max(parseFloat(goal.target_amount) - parseFloat(goal.current_amount), 0);
  const typeInfo    = GOAL_TYPE_LABELS[goal.goal_type] || { label: goal.goal_type, variant: "default" };

  const columns = [
    {
      key:    "contribution_date",
      label:  "Date",
      render: (row) => (
        <span className="text-skin-text text-sm">
          {new Date(row.contribution_date).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </span>
      ),
    },
    {
      key:    "account_name",
      label:  "From Account",
      render: (row) => (
        <span className="text-skin-text text-sm">{row.account_name}</span>
      ),
    },
    {
      key:    "amount",
      label:  "Amount",
      render: (row) => (
        <span className="text-emerald-500 font-semibold text-sm">
          +{parseFloat(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key:    "description",
      label:  "Description",
      render: (row) => (
        <span className="text-skin-text-secondary text-sm">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key:    "actions",
      label:  "",
      render: (row) => (
        <button
          onClick={() => onDeleteContribution(row)}
          className="text-skin-text-muted hover:text-red-500 transition-colors duration-150 p-1 rounded-lg hover:bg-red-500/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-skin-text-secondary hover:text-skin-text transition-colors duration-150 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Goals
        </button>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <Button variant="primary" size="sm" onClick={onAddContribution}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
              iconPosition="left"
            >
              Add Contribution
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => onDeleteGoal(goal)}>
            Delete Goal
          </Button>
        </div>
      </div>

      {/* ── Goal header card ── */}
      <div className="bg-skin-card border border-skin-border rounded-2xl p-6 mb-6 animate-slide-up"
        style={{ boxShadow: "var(--shadow-md)" }}>

        {/* ── Name + badges ── */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="text-skin-text font-bold text-xl leading-snug">
            {goal.goal_name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
            {isCompleted
              ? <Badge variant="success">Completed ✓</Badge>
              : goal.deadline && (
                  <Badge variant="default">
                    Due {new Date(goal.deadline).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </Badge>
                )
            }
          </div>
        </div>

        {/* ── Stat row ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-skin-secondary border border-skin-border rounded-xl px-4 py-3">
            <p className="text-xs text-skin-text-muted mb-1">Saved</p>
            <p className="text-lg font-bold text-emerald-500">
              {parseFloat(goal.current_amount).toFixed(2)}
            </p>
          </div>
          <div className="bg-skin-secondary border border-skin-border rounded-xl px-4 py-3">
            <p className="text-xs text-skin-text-muted mb-1">Target</p>
            <p className="text-lg font-bold text-skin-text">
              {parseFloat(goal.target_amount).toFixed(2)}
            </p>
          </div>
          <div className="bg-skin-secondary border border-skin-border rounded-xl px-4 py-3">
            <p className="text-xs text-skin-text-muted mb-1">Remaining</p>
            <p className={`text-lg font-bold ${isCompleted ? "text-emerald-500" : "text-skin-text"}`}>
              {isCompleted ? "Done!" : remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div>
          <div className="flex justify-between text-xs text-skin-text-muted mb-1.5">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-skin-hover rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-emerald-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Contributions table ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-skin-text font-semibold text-base">Contributions</h3>
        <span className="text-skin-text-muted text-sm">{contributions.length} total</span>
      </div>

      <Table
        columns={columns}
        data={contributions}
        loading={loading}
        emptyMessage="No contributions yet. Add your first contribution to get started."
      />
    </div>
  );
}