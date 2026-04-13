import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import GoalsBLL from "../../bll/GoalsBLL.js";
import { formatCurrency } from "../../utils/formatters.js";

export default function AddContributionModal({ goal, accounts, onClose, onContributed }) {
  const [form, setForm] = useState({
    account_id:        "",
    amount:            "",
    contribution_date: new Date().toISOString().split("T")[0],
    description:       "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]     = useState(false);

  const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);

  const accountOptions = [
    { value: "", label: "Select account..." },
    ...accounts.map((a) => ({
      value: a.account_id,
      label: `${a.account_name} (${a.currency_symbol}${parseFloat(a.balance).toFixed(2)})`,
    })),
  ];

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setApiError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await GoalsBLL.addContribution({
      ...form,
      goal_id: goal.goal_id,
    });
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setApiError(result.error);
      setSaving(false);
      return;
    }
    onContributed(parseFloat(form.amount), parseInt(form.account_id));
  };

  return (
    <Modal
      title="Add Contribution"
      description={`Contributing towards: ${goal.goal_name}`}
      onClose={onClose}
      size="md"
    >
      <div className="px-6 pb-2 space-y-1">

        {/* ── Remaining amount hint ── */}
        <div className="bg-skin-secondary border border-skin-border rounded-xl px-4 py-3 mb-3">
          <p className="text-xs text-skin-text-muted">Remaining to reach goal</p>
          <p className="text-lg font-bold text-emerald-500 mt-0.5">
            {remaining.toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            From Account
          </label>
          <Select
            value={form.account_id}
            onChange={handle("account_id")}
            options={accountOptions}
            className="w-full"
          />
          {errors.account_id && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.account_id}
            </p>
          )}
        </div>

        <Input
          id="amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={handle("amount")}
          error={errors.amount}
        />

        <Input
          id="contribution_date"
          label="Date"
          type="date"
          value={form.contribution_date}
          onChange={handle("contribution_date")}
          error={errors.contribution_date}
        />

        <Input
          id="description"
          label="Description"
          placeholder="e.g. Monthly savings deposit"
          value={form.description}
          onChange={handle("description")}
          error={errors.description}
          optional
        />

        {apiError && (
          <p className="text-xs text-red-500 flex items-center gap-1 pb-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {apiError}
          </p>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" loading={saving} onClick={handleSubmit}>
          Add Contribution
        </Button>
      </div>
    </Modal>
  );
}