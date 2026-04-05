import { useState, useEffect } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import TransactionsBLL from "../../bll/TransactionsBLL.js";
import CategoriesBLL from "../../bll/CategoriesBLL.js";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "",         label: "Select type..."  },
  { value: "income",   label: "Income"          },
  { value: "expense",  label: "Expense"         },
  { value: "transfer", label: "Transfer"        },
];

export default function AddTransactionModal({ account, onClose, onCreated }) {
  const [form, setForm] = useState({
    amount: "", transaction_type: "", category_id: "",
    description: "", transaction_date: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories]   = useState([]);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await CategoriesBLL.getAll();
      if (result.success) setCategories(result.categories);
    };
    load();
  }, []);

  const filteredCategories = categories.filter(
    (c) => !form.transaction_type || c.type === form.transaction_type
  );

  const categoryOptions = [
    { value: "", label: "Select category (optional)" },
    ...filteredCategories.map((c) => ({ value: c.category_id, label: c.name })),
  ];

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
      ...(field === "transaction_type" ? { category_id: "" } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setServerError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await TransactionsBLL.create({
      ...form,
      account_id: account.account_id,
    });
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setServerError(result.error);
      setSaving(false);
      return;
    }
    const category = categories.find((c) => c.category_id == form.category_id);
    onCreated({
      transaction_id:   Date.now(),
      account_id:       account.account_id,
      amount:           form.amount,
      transaction_type: form.transaction_type,
      category_id:      form.category_id,
      category_name:    category?.name ?? null,
      description:      form.description,
      transaction_date: form.transaction_date,
    });
  };

  return (
    <Modal
      title="Add Transaction"
      description={`Adding to: ${account.account_name}`}
      showFooter
      confirmLabel="Add Transaction"
      cancelLabel="Cancel"
      onConfirm={handleSubmit}
      onClose={onClose}
      loading={saving}
      size="md"
    >
      <div className="pt-2 space-y-1">
        {serverError && (
          <p className="text-red-500 text-sm mb-3">{serverError}</p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Transaction Type
          </label>
          <Select
            value={form.transaction_type}
            onChange={handleChange("transaction_type")}
            options={TRANSACTION_TYPE_OPTIONS}
            className="w-full"
          />
          {errors.transaction_type && (
            <p className="mt-1.5 text-xs text-red-500">{errors.transaction_type}</p>
          )}
        </div>
        <Input
          id="amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange("amount")}
          error={errors.amount}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Category
          </label>
          <Select
            value={form.category_id}
            onChange={handleChange("category_id")}
            options={categoryOptions}
            className="w-full"
          />
        </div>
        <Input
          id="transaction_date"
          label="Date"
          type="date"
          value={form.transaction_date}
          onChange={handleChange("transaction_date")}
          error={errors.transaction_date}
        />
        <Input
          id="description"
          label="Description"
          placeholder="e.g. Grocery shopping"
          value={form.description}
          onChange={handleChange("description")}
          optional
        />
      </div>
    </Modal>
  );
}