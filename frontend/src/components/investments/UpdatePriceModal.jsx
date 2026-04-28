import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import InvestmentsBLL from "../../bll/InvestmentsBLL.js";

export default function UpdatePriceModal({ investment, onClose, onUpdated }) {
  const [price, setPrice]       = useState(
    investment.current_price != null ? String(investment.current_price) : ""
  );
  const [error, setError]       = useState(null);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]     = useState(false);

  const sym = investment.currency_symbol ?? "";

  const handleSubmit = async () => {
    setSaving(true);
    const result = await InvestmentsBLL.updateManualPrice(investment.investment_id, price);

    if (!result.success) {
      if (result.validationErrors?.current_price) setError(result.validationErrors.current_price);
      else setApiError(result.error);
      setSaving(false);
      return;
    }

    onUpdated(investment.investment_id, result.current_price);
  };

  return (
    <Modal
      title="Update Current Price"
      description={`Enter the current market value per unit for "${investment.investment_name}".`}
      onClose={onClose}
      size="sm"
    >
      <div className="px-6 pb-2">
        <Input
          id="current_price"
          label={`Current Price${sym ? ` (${investment.currency_code})` : ""}`}
          type="number"
          placeholder="0.00"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setError(null);
            setApiError("");
          }}
          error={error}
        />

        {apiError && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {apiError}
          </p>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="primary"   className="flex-1" loading={saving} onClick={handleSubmit}>
          Update Price
        </Button>
      </div>
    </Modal>
  );
}