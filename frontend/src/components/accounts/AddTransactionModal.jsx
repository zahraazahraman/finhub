import { useState, useEffect } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import TransactionsBLL from "../../bll/TransactionsBLL.js";
import CategoriesBLL from "../../bll/CategoriesBLL.js";
import api from "../../utils/api.js";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "",         label: "Select type..."  },
  { value: "income",   label: "Income"          },
  { value: "expense",  label: "Expense"         },
  { value: "transfer", label: "Transfer"        },
];

export default function AddTransactionModal({ account, receiptData, onClose, onCreated }) {
  const [form, setForm] = useState({
    amount:           receiptData?.amount       ?? "",
    transaction_type: receiptData?.amount       ? "expense" : "",
    category_id:      "",
    description:      receiptData?.description  ?? "",
    transaction_date: receiptData?.date         ?? new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories]       = useState([]);
  const [errors, setErrors]               = useState({});
  const [serverError, setServerError]     = useState("");
  const [saving, setSaving]               = useState(false);
  const [conversionInfo, setConversionInfo]   = useState(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionFailed, setConversionFailed]   = useState(false);

  const isCrossCurrency =
    receiptData?.currency &&
    account?.currency_code &&
    receiptData.currency.toUpperCase() !== account.currency_code.toUpperCase();

  useEffect(() => {
    const load = async () => {
      const result = await CategoriesBLL.getAll();
      if (result.success) setCategories(result.categories);
    };
    load();
  }, []);

  useEffect(() => {
    if (!receiptData?.category || categories.length === 0) return;
    const type  = receiptData?.amount ? "expense" : "";
    const match = categories.find(
      (c) =>
        c.name.toLowerCase() === receiptData.category.toLowerCase() &&
        (!type || c.type === type)
    );
    if (match) {
      setForm((prev) => ({ ...prev, category_id: match.category_id }));
    }
  }, [categories, receiptData]);

  useEffect(() => {
    if (!isCrossCurrency || !receiptData?.amount) return;
    const from = receiptData.currency.toUpperCase();
    const to   = account.currency_code.toUpperCase();
    const fetchRate = async () => {
      setConversionLoading(true);
      const { ok, data } = await api.get(
        `/exchange-rate?from=${from}&to=${to}&amount=${receiptData.amount}`
      );
      setConversionLoading(false);
      if (ok && data.success) {
        setConversionInfo({
          originalAmount:   receiptData.amount,
          originalCurrency: from,
          convertedAmount:  data.converted_amount,
          accountCurrency:  to,
          rate:             data.rate,
        });
        setForm((prev) => ({ ...prev, amount: data.converted_amount }));
      } else {
        setConversionFailed(true);
      }
    };
    fetchRate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {receiptData && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-emerald-500 text-xs">
              Receipt scanned successfully. Review and confirm the details below.
            </p>
          </div>
        )}

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
        {conversionLoading && (
          <p className="text-xs text-skin-text-muted -mt-2">
            Converting from {receiptData.currency.toUpperCase()}...
          </p>
        )}
        {conversionInfo && (
          <p className="text-xs text-skin-text-muted -mt-2">
            Receipt: {conversionInfo.originalAmount} {conversionInfo.originalCurrency} → {conversionInfo.convertedAmount} {conversionInfo.accountCurrency}
          </p>
        )}
        {conversionFailed && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 -mt-2">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-amber-500 text-xs">
              Receipt was in {receiptData.currency.toUpperCase()} but this account uses {account.currency_code.toUpperCase()}. Could not fetch exchange rate — please enter the correct amount manually.
            </p>
          </div>
        )}
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