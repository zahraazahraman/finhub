import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import AccountsBLL from "../../bll/AccountsBLL.js";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "",            label: "Select type..."   },
  { value: "bank",        label: "Bank"             },
  { value: "cash",        label: "Cash"             },
  { value: "credit_card", label: "Credit Card"      },
  { value: "wallet",      label: "Wallet"           },
];

export default function AddAccountModal({ currencies, onClose, onCreated }) {
  const [form, setForm] = useState({
    account_name: "", account_type: "", currency_id: "",
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving]       = useState(false);

  const currencyOptions = [
    { value: "", label: "Select currency..." },
    ...currencies.map((c) => ({ value: c.currency_id, label: `${c.code} — ${c.name}` })),
  ];

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setServerError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await AccountsBLL.create(form);
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setServerError(result.error);
      setSaving(false);
      return;
    }
    // Re-fetch isn't needed — we optimistically return the form data
    // with currency info attached for immediate UI update
    const currency = currencies.find((c) => c.currency_id == form.currency_id);
    onCreated({
      account_id:      result.account_id,
      account_name:    form.account_name,
      account_type:    form.account_type,
      currency_id:     form.currency_id,
      currency_code:   currency?.code   ?? "",
      currency_symbol: currency?.symbol ?? "",
      balance:         "0.00",
    });
  };

  return (
    <Modal
      title="New Account"
      description="Add a new account to track your finances."
      showFooter
      confirmLabel="Create Account"
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
        <Input
          id="account_name"
          label="Account Name"
          placeholder="e.g. My Bank Account"
          value={form.account_name}
          onChange={handleChange("account_name")}
          error={errors.account_name}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Account Type
          </label>
          <Select
            value={form.account_type}
            onChange={handleChange("account_type")}
            options={ACCOUNT_TYPE_OPTIONS}
            className="w-full"
          />
          {errors.account_type && (
            <p className="mt-1.5 text-xs text-red-500">{errors.account_type}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
            Currency
          </label>
          <Select
            value={form.currency_id}
            onChange={handleChange("currency_id")}
            options={currencyOptions}
            className="w-full"
          />
          {errors.currency_id && (
            <p className="mt-1.5 text-xs text-red-500">{errors.currency_id}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}