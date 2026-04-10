import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { formatDate, formatCurrency } from "../../utils/formatters.js";

const GOAL_TYPE_STYLES = {
    saving:          { variant: "success", label: "Saving"          },
    debt_repayment:  { variant: "danger",  label: "Debt Repayment"  },
};

const GOAL_TYPE_COLORS = {
    saving:         "#10b981",
    debt_repayment: "#f87171",
};

function GoalRow({ goal }) {
    const { variant, label } = GOAL_TYPE_STYLES[goal.goal_type] ?? { variant: "default", label: goal.goal_type };
    const color    = GOAL_TYPE_COLORS[goal.goal_type] ?? "#10b981";
    const progress = Math.min(parseFloat(goal.progress), 100);

    const isOverdue  = goal.deadline && new Date(goal.deadline) < new Date();
    const daysLeft   = goal.deadline
        ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="py-4 border-b border-skin-border last:border-0">
            {/* Top row — name + badge */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                        ${goal.goal_type === "saving"
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-red-500/10 border border-red-500/20"}`}>
                        {goal.goal_type === "saving" ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        )}
                    </div>
                    <p className="text-skin-text text-sm font-medium truncate">{goal.goal_name}</p>
                </div>
                <Badge variant={variant} size="sm">{label}</Badge>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-skin-hover rounded-full overflow-hidden mb-2">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                />
            </div>

            {/* Bottom row — amounts + deadline */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-skin-text text-xs font-semibold">
                        {formatCurrency(goal.current_amount)}
                    </span>
                    <span className="text-skin-text-muted text-xs">
                        / {formatCurrency(goal.target_amount)}
                    </span>
                    <span className="text-skin-text-muted text-xs">
                        · {progress}%
                    </span>
                </div>

                {goal.deadline && (
                    <span className={`text-xs font-medium ${
                        isOverdue
                            ? "text-red-500"
                            : daysLeft <= 7
                                ? "text-yellow-500"
                                : "text-skin-text-muted"
                    }`}>
                        {isOverdue
                            ? "Overdue"
                            : daysLeft === 0
                                ? "Due today"
                                : `${daysLeft}d left`}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function DashboardGoals({ goals = [] }) {
    return (
        <Card padding="md">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-skin-text font-semibold">Active Goals</h2>
                    <p className="text-skin-text-muted text-xs mt-0.5">
                        Your top {goals.length} in-progress goal{goals.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center
                                bg-purple-500/10 border-purple-500/20 text-purple-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
            </div>

            {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-skin-hover border border-skin-border
                                    flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <p className="text-skin-text-muted text-sm">No active goals yet.</p>
                    <p className="text-skin-text-muted text-xs mt-0.5">
                        Create a goal to start tracking your progress.
                    </p>
                </div>
            ) : (
                <div>
                    {goals.map((goal) => (
                        <GoalRow key={goal.goal_id} goal={goal} />
                    ))}
                </div>
            )}
        </Card>
    );
}