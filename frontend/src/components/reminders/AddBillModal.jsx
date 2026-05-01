import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import BillsBLL from "../../bll/BillsBLL.js";

const RECURRENCE_OPTIONS = [
  { value: "none",    label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly",  label: "Yearly" },
];

export default function AddBillModal({ currencies, categories, onClose, onCreated, onUpdated, initialBill = null }) {
  const [form, setForm] = useState(() => ({
    name: initialBill?.name ?? "",
    amount: initialBill?.amount ?? "",
    currency_id: initialBill?.currency_id?.toString?.() ?? initialBill?.currency_id ?? "",
    due_date: initialBill?.due_date ?? "",
    recurrence_type: initialBill?.recurrence_type ?? "none",
    category_id: initialBill?.category_id?.toString?.() ?? initialBill?.category_id ?? "",
  }));
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]     = useState(false);

  const currencyOptions = [
    { value: "", label: "Select currency..." },
    ...currencies.map(c => ({ value: c.currency_id, label: `${c.code} — ${c.name}` })),
  ];

  const categoryOptions = [
    { value: "", label: "None (optional)" },
    ...categories.map(c => ({ value: c.category_id, label: c.name })),
  ];

  const handle = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setApiError("");
  };

  const isEditing = Boolean(initialBill?.bill_id);

  const handleSubmit = async () => {
    setSaving(true);
    const result = isEditing
      ? await BillsBLL.update(initialBill.bill_id, form)
      : await BillsBLL.create(form);
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setApiError(result.error);
      setSaving(false);
      return;
    }
    if (isEditing) onUpdated?.(result.bill);
    else onCreated(result.bill);
  };

  return (
    <Modal
      title={isEditing ? "Edit Bill" : "Add New Bill"}
      description="Track a recurring or one-time bill with an optional email reminder."
      onClose={onClose}
      size="md"
    >
      <div className="px-6 pb-2 space-y-1">

        <Input
          id="name"
          label="Bill Name"
          placeholder="e.g. Electricity, Netflix, Rent"
          value={form.name}
          onChange={handle("name")}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="amount"
            label="Amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handle("amount")}
            error={errors.amount}
          />

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">Currency</label>
            <Select value={form.currency_id} onChange={handle("currency_id")} options={currencyOptions} className="w-full" />
            {errors.currency_id && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {errors.currency_id}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="due_date"
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={handle("due_date")}
            error={errors.due_date}
          />

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">Recurrence</label>
            <Select value={form.recurrence_type} onChange={handle("recurrence_type")} options={RECURRENCE_OPTIONS} className="w-full" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Category <span className="text-skin-text-muted font-normal">(optional)</span>
          </label>
          <Select value={form.category_id} onChange={handle("category_id")} options={categoryOptions} className="w-full" />
        </div>

        {apiError && (
          <p className="text-xs text-red-500 flex items-center gap-1 pb-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {apiError}
          </p>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="primary" className="flex-1" loading={saving} onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Bill"}</Button>
      </div>
    </Modal>
  );
}