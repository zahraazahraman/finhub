import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import { formatDate } from "../../utils/formatters.js";
import { BILL_RECURRENCE_LABELS, BILL_RECURRENCE_STYLES } from "../../utils/constants.js";

function isBillPaid(value) {
  return Number(value) === 1;
}

function getDueDateBadge(dueDate, isPaid) {
  if (isBillPaid(isPaid)) return { label: "Paid", variant: "success" };
  if (!dueDate) return { label: "—", variant: "default" };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0)  return { label: "Overdue",        variant: "danger" };
  if (diff === 0) return { label: "Due Today",      variant: "danger" };
  if (diff <= 3)  return { label: `${diff}d left`,  variant: "warning" };
  if (diff <= 7)  return { label: `${diff}d left`,  variant: "info" };
  return { label: formatDate(dueDate), variant: "default" };
}

export default function BillCard({ bill, onSelect, onDelete }) {
  const dueBadge = getDueDateBadge(bill.due_date, bill.is_paid);

  return (
    <Card hover className="cursor-pointer" onClick={() => onSelect(bill)}>
      <div className="p-4 flex flex-col gap-3">

        {/* ── Top row: name + recurrence badge + delete ── */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-skin-text leading-snug truncate">
            {bill.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={BILL_RECURRENCE_STYLES[bill.recurrence_type]} size="sm">
              {BILL_RECURRENCE_LABELS[bill.recurrence_type]}
            </Badge>
            <button
              className="text-skin-text-muted hover:text-red-500 transition-colors p-0.5 rounded"
              onClick={(e) => { e.stopPropagation(); onDelete(bill); }}
              title="Delete bill"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Category ── */}
        {bill.category_name && (
          <span className="text-xs text-skin-text-muted">{bill.category_name}</span>
        )}

        {/* ── Bottom row: amount + due badge ── */}
        <div className="flex items-center justify-between pt-1 border-t border-skin-border">
          <span className="text-base font-bold text-skin-text">
            {bill.currency_symbol}{Number(bill.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <Badge variant={dueBadge.variant} size="sm">{dueBadge.label}</Badge>
        </div>

      </div>
    </Card>
  );
}