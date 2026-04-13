import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";

const GOAL_TYPE_LABELS = {
  saving:          { label: "Saving",          variant: "info"   },
  debt_repayment:  { label: "Debt Repayment",  variant: "orange" },
};

function getDeadlineBadge(deadline) {
  if (!deadline) return null;
  const today     = new Date();
  const due       = new Date(deadline);
  const daysLeft  = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)  return { label: "Overdue",               variant: "danger"  };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`,     variant: "warning" };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`,    variant: "info"    };
  return { label: new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), variant: "default" };
}

export default function GoalCard({ goal, onSelect, onDelete }) {
  const progress    = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100);
  const isCompleted = progress >= 100;
  const typeInfo    = GOAL_TYPE_LABELS[goal.goal_type] || { label: goal.goal_type, variant: "default" };
  const deadlineBadge = getDeadlineBadge(goal.deadline);

  return (
    <Card hover padding="md" className="relative group" >

      {/* ── Delete button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(goal); }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                   text-skin-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {/* ── Clickable area ── */}
      <div onClick={() => onSelect(goal)} className="cursor-pointer">

        {/* ── Badges ── */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant={typeInfo.variant} size="sm">{typeInfo.label}</Badge>
          {isCompleted && <Badge variant="success" size="sm">Completed ✓</Badge>}
          {!isCompleted && deadlineBadge && (
            <Badge variant={deadlineBadge.variant} size="sm">{deadlineBadge.label}</Badge>
          )}
        </div>

        {/* ── Goal name ── */}
        <h3 className="text-skin-text font-semibold text-base mb-3 pr-6 leading-snug">
          {goal.goal_name}
        </h3>

        {/* ── Progress bar ── */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-skin-text-muted mb-1.5">
            <span>{parseFloat(goal.current_amount).toFixed(2)} saved</span>
            <span>{parseFloat(goal.target_amount).toFixed(2)} goal</span>
          </div>
          <div className="w-full bg-skin-hover rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-emerald-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-skin-text-muted mt-1">
            {progress.toFixed(1)}%
          </p>
        </div>

      </div>
    </Card>
  );
}