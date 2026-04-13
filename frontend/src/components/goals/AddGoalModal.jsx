import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import GoalsBLL from "../../bll/GoalsBLL.js";

const GOAL_TYPE_OPTIONS = [
  { value: "", label: "Select type..." },
  { value: "saving", label: "Saving" },
  { value: "debt_repayment", label: "Debt Repayment" },
];

export default function AddGoalModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    goal_name:     "",
    goal_type:     "",
    target_amount: "",
    deadline:      "",
  });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]   = useState(false);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setApiError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await GoalsBLL.create(form);
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setApiError(result.error);
      setSaving(false);
      return;
    }
    onCreated({ ...form, goal_id: result.goal_id, current_amount: 0 });
  };

  return (
    <Modal
      title="Create New Goal"
      description="Set a financial goal and start tracking your progress."
      onClose={onClose}
      size="md"
    >
      <div className="px-6 pb-2 space-y-1">

        <Input
          id="goal_name"
          label="Goal Name"
          placeholder="e.g. Emergency Fund, Pay Car Loan"
          value={form.goal_name}
          onChange={handle("goal_name")}
          error={errors.goal_name}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Goal Type
          </label>
          <Select
            value={form.goal_type}
            onChange={handle("goal_type")}
            options={GOAL_TYPE_OPTIONS}
            className="w-full"
          />
          {errors.goal_type && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.goal_type}
            </p>
          )}
        </div>

        <Input
          id="target_amount"
          label="Target Amount"
          type="number"
          placeholder="0.00"
          value={form.target_amount}
          onChange={handle("target_amount")}
          error={errors.target_amount}
        />

        <Input
          id="deadline"
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={handle("deadline")}
          error={errors.deadline}
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
          Create Goal
        </Button>
      </div>
    </Modal>
  );
}