import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import BillsBLL from "../../bll/BillsBLL.js";
import { formatDate } from "../../utils/formatters.js";
import { BILL_REMINDER_DAYS_OPTIONS } from "../../utils/constants.js";

export default function AddReminderModal({ bill, onClose, onAdded }) {
  const [daysBefore, setDaysBefore] = useState("");
  const [error, setError]           = useState("");
  const [apiError, setApiError]     = useState("");
  const [saving, setSaving]         = useState(false);

  const options = [
    { value: "", label: "Select..." },
    ...BILL_REMINDER_DAYS_OPTIONS.map(o => ({ value: o.value, label: o.label })),
  ];

  // Preview the computed reminder date
  const previewDate = (() => {
    if (!daysBefore || !bill.due_date) return null;
    const d = new Date(bill.due_date);
    d.setDate(d.getDate() - parseInt(daysBefore));
    return formatDate(d.toISOString().split("T")[0]);
  })();

  const handleSubmit = async () => {
    if (!daysBefore) { setError("Please select a reminder time."); return; }
    setSaving(true);
    const result = await BillsBLL.addReminder({ bill_id: bill.bill_id, days_before: parseInt(daysBefore) });
    if (!result.success) {
      setApiError(result.error);
      setSaving(false);
      return;
    }
    onAdded(result.reminder);
  };

  return (
    <Modal
      title="Add Email Reminder"
      description={`Set an email reminder for "${bill.name}" (due ${formatDate(bill.due_date)}).`}
      onClose={onClose}
      size="sm"
    >
      <div className="px-6 pb-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Remind me
          </label>
          <Select
            value={daysBefore}
            onChange={(e) => { setDaysBefore(e.target.value); setError(""); setApiError(""); }}
            options={options}
            className="w-full"
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-500">{error}</p>
          )}
        </div>

        {previewDate && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-skin-secondary">
            <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-sm text-skin-text">
              Email will be sent on <span className="font-semibold">{previewDate}</span>
            </p>
          </div>
        )}

        {apiError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {apiError}
          </p>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="primary" className="flex-1" loading={saving} onClick={handleSubmit}>Set Reminder</Button>
      </div>
    </Modal>
  );
}