import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import InvestmentsBLL from "../../bll/InvestmentsBLL.js";

const INVESTMENT_TYPE_OPTIONS = [
  { value: "",            label: "Select type..."  },
  { value: "stock",       label: "Stock"           },
  { value: "crypto",      label: "Cryptocurrency"  },
  { value: "real_estate", label: "Real Estate"     },
  { value: "other",       label: "Other"           },
];

function SelectField({ label, value, onChange, options, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">{label}</label>
      <Select value={value} onChange={onChange} options={options} className="w-full" />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddInvestmentModal({ currencies = [], onClose, onCreated }) {
  const [form, setForm] = useState({
    investment_name: "",
    symbol:          "",
    investment_type: "",
    quantity:        "",
    purchase_price:  "",
    current_price:   "",
    currency_id:     "",
    purchase_date:   "",
    notes:           "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]     = useState(false);

  const currencyOptions = [
    { value: "", label: "Select currency..." },
    ...currencies.map((c) => ({
      value: c.currency_id,
      label: `${c.code} — ${c.name}`,
    })),
  ];

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setApiError("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await InvestmentsBLL.create(form);
    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setApiError(result.error);
      setSaving(false);
      return;
    }

    const selectedCurrency = currencies.find(
      (c) => String(c.currency_id) === String(form.currency_id)
    );

    onCreated({
      ...form,
      investment_id:   result.investment_id,
      currency_code:   selectedCurrency?.code   ?? "",
      currency_symbol: selectedCurrency?.symbol ?? "",
    });
  };

  return (
    <Modal
      title="Add Investment"
      description="Track a new investment in your portfolio."
      onClose={onClose}
      size="xl"
    >
      {/* ── 2-column on sm+, 1-column on mobile ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">

        {/* ── Left column ── */}
        <div>
          <Input
            id="investment_name"
            label="Investment Name"
            placeholder="e.g. Apple Inc., Bitcoin"
            value={form.investment_name}
            onChange={handle("investment_name")}
            error={errors.investment_name}
          />

          <SelectField
            label="Type"
            value={form.investment_type}
            onChange={handle("investment_type")}
            options={INVESTMENT_TYPE_OPTIONS}
            error={errors.investment_type}
          />

          <Input
            id="symbol"
            label="Ticker / Symbol"
            placeholder="e.g. AAPL, BTC"
            value={form.symbol}
            onChange={handle("symbol")}
            error={errors.symbol}
            optional
          />

          <SelectField
            label="Currency"
            value={form.currency_id}
            onChange={handle("currency_id")}
            options={currencyOptions}
            error={errors.currency_id}
          />
        </div>

        {/* ── Right column ── */}
        <div>
          <Input
            id="quantity"
            label="Quantity"
            type="number"
            placeholder="0"
            value={form.quantity}
            onChange={handle("quantity")}
            error={errors.quantity}
          />

          <Input
            id="purchase_price"
            label="Purchase Price"
            type="number"
            placeholder="0.00"
            value={form.purchase_price}
            onChange={handle("purchase_price")}
            error={errors.purchase_price}
          />

          <Input
            id="current_price"
            label="Current Price"
            type="number"
            placeholder="0.00"
            value={form.current_price}
            onChange={handle("current_price")}
            error={errors.current_price}
            optional
          />

          <Input
            id="purchase_date"
            label="Purchase Date"
            type="date"
            value={form.purchase_date}
            onChange={handle("purchase_date")}
            error={errors.purchase_date}
          />

          <Input
            id="notes"
            label="Notes"
            placeholder="Any notes about this investment..."
            value={form.notes}
            onChange={handle("notes")}
            error={errors.notes}
            optional
          />
        </div>
      </div>

      {/* ── API error ── */}
      {apiError && (
        <p className="text-xs text-red-500 flex items-center gap-1 pb-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {apiError}
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 pb-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="primary"   className="flex-1" loading={saving} onClick={handleSubmit}>
          Add Investment
        </Button>
      </div>
    </Modal>
  );
}