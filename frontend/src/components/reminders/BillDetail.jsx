import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import Spinner from "../ui/Spinner.jsx";
import { formatDate, formatDateTime } from "../../utils/formatters.js";
import { BILL_RECURRENCE_LABELS, BILL_RECURRENCE_STYLES, MAX_REMINDERS_PER_USER } from "../../utils/constants.js";

function isBillPaid(value) {
  return Number(value) === 1;
}

function getDueBadge(dueDate, isPaid) {
  if (isBillPaid(isPaid)) return { label: "Paid", variant: "success" };
  if (!dueDate) return { label: "—", variant: "default" };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0)   return { label: "Overdue",       variant: "danger" };
  if (diff === 0) return { label: "Due Today",     variant: "danger" };
  if (diff <= 3)  return { label: `${diff}d left`, variant: "warning" };
  if (diff <= 7)  return { label: `${diff}d left`, variant: "info" };
  return { label: formatDate(dueDate), variant: "default" };
}

export default function BillDetail({
  bill, reminders, remindersLoading, totalReminderCount,
  onBack, onMarkPaid, onMarkUnpaid, markingPaid,
  onAddReminder, onEditReminder, onEditBill, onDeleteReminder, onDeleteBill,
}) {
  const isPaid = isBillPaid(bill.is_paid);
  const dueBadge = getDueBadge(bill.due_date, bill.is_paid);
  const atLimit  = totalReminderCount >= MAX_REMINDERS_PER_USER;

  const statCards = [
    {
      label: "Amount",
      value: `${bill.currency_symbol}${Number(bill.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${bill.currency_code}`,
    },
    {
      label: "Due Date",
      value: bill.due_date ? formatDate(bill.due_date) : "—",
    },
    {
      label: "Recurrence",
      value: BILL_RECURRENCE_LABELS[bill.recurrence_type],
    },
    {
      label: "Category",
      value: bill.category_name || "—",
    },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-skin-text-secondary hover:text-skin-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-skin-text">{bill.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={dueBadge.variant} size="sm">{dueBadge.label}</Badge>
              <Badge variant={BILL_RECURRENCE_STYLES[bill.recurrence_type]} size="sm">
                {BILL_RECURRENCE_LABELS[bill.recurrence_type]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPaid ? (
            <Button
              variant="primary"
              size="sm"
              loading={markingPaid}
              onClick={onMarkPaid}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
              iconPosition="left"
            >
              Mark as Paid
            </Button>
          ) : (
            <Button variant="secondary" size="sm" loading={markingPaid} onClick={onMarkUnpaid}>
              Mark as Unpaid
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onEditBill(bill)}>
            Edit Bill
          </Button>
          <button
            onClick={() => onDeleteBill(bill)}
            className="p-2 rounded-lg text-skin-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            title="Delete bill"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-skin-text-muted mb-1">{s.label}</p>
            <p className="font-semibold text-skin-text text-sm">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* ── Reminders section ── */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-skin-text">Email Reminders</h3>
            <p className="text-xs text-skin-text-muted mt-0.5">
              {totalReminderCount}/{MAX_REMINDERS_PER_USER} reminders used across all bills
            </p>
          </div>
          {!isPaid && (
            <Button
              variant="secondary"
              size="sm"
              disabled={atLimit}
              onClick={onAddReminder}
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              iconPosition="left"
            >
              Add Reminder
            </Button>
          )}
        </div>

        {remindersLoading ? (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-8 h-8 text-skin-text-muted mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm text-skin-text-muted">No reminders set for this bill.</p>
            {isPaid && <p className="text-xs text-skin-text-muted mt-1">Mark the bill as unpaid to add reminders.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.reminder_id} className="flex items-center justify-between p-3 rounded-lg bg-skin-secondary">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-skin-brand-subtle flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-skin-text">{r.days_before} {r.days_before === 1 ? "day" : "days"} before due</p>
                    <p className="text-xs text-skin-text-muted">Sends on {formatDateTime(r.reminder_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.is_sent ? "success" : "warning"} size="sm">
                    {r.is_sent ? "Sent" : "Pending"}
                  </Badge>
                  <button
                    onClick={() => onDeleteReminder(r)}
                    className="text-skin-text-muted hover:text-red-500 transition-colors p-1 rounded"
                    title="Delete reminder"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEditReminder(r)}
                    className="text-skin-text-muted hover:text-emerald-500 transition-colors p-1 rounded"
                    title="Edit reminder"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20l4-1 9-9a2.828 2.828 0 10-4-4l-9 9-1 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {atLimit && !isPaid && (
          <p className="text-xs text-skin-text-muted mt-3 text-center">
            You've reached the limit of {MAX_REMINDERS_PER_USER} reminders. Delete an existing reminder to add a new one.
          </p>
        )}
      </Card>
    </div>
  );
}