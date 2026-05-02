import { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import Spinner from "../ui/Spinner.jsx";
import GoalsBLL from "../../bll/GoalsBLL.js";
import api from "../../utils/api.js";
import { formatNumber } from "../../utils/formatters.js";

export default function AddContributionModal({ goal, accounts, onClose, onContributed }) {
  const [form, setForm] = useState({
    account_id:        "",
    amount:            "",
    converted_amount:  "",
    contribution_date: new Date().toISOString().split("T")[0],
    description:       "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving]     = useState(false);

  // ── Conversion state ──
  const [rateLoading, setRateLoading]   = useState(false);
  const [rateFailed, setRateFailed]     = useState(false);
  const [conversionInfo, setConversionInfo] = useState(null);
  // conversionInfo: { rate, convertedAmount, fromCode, toCode } | null

  const debounceRef = useRef(null);

  const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);

  const accountOptions = [
    { value: "", label: "Select account..." },
    ...accounts.map((a) => ({
      value: a.account_id,
      label: `${a.account_name} (${a.currency_symbol}${formatNumber(a.balance)})`,
    })),
  ];

  // ── Resolve selected account object ──
  const selectedAccount = accounts.find(
    (a) => String(a.account_id) === String(form.account_id)
  ) ?? null;

  const isCrossCurrency =
    selectedAccount &&
    goal &&
    selectedAccount.currency_code &&
    goal.currency_code &&
    typeof selectedAccount.currency_code === 'string' &&
    typeof goal.currency_code === 'string' &&
    selectedAccount.currency_code.trim() !== '' &&
    goal.currency_code.trim() !== '' &&
    selectedAccount.currency_code.toUpperCase() !== goal.currency_code.toUpperCase();

  // ── Fetch rate whenever account or amount changes ──
  useEffect(() => {
    if (!isCrossCurrency || !form.amount || parseFloat(form.amount) <= 0) {
      setConversionInfo(null);
      setRateFailed(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setRateLoading(true);
      setRateFailed(false);
      setConversionInfo(null);

      const fromCode = selectedAccount?.currency_code?.trim();
      const toCode = goal?.currency_code?.trim();

      // Additional validation to prevent API calls with invalid currency codes
      if (!fromCode || !toCode || fromCode === 'undefined' || toCode === 'undefined' || fromCode.length !== 3 || toCode.length !== 3) {
        setRateFailed(true);
        setRateLoading(false);
        return;
      }

      const { ok, data } = await api.get(
        `/exchange-rate?from=${fromCode}&to=${toCode}&amount=${form.amount}`
      );

      setRateLoading(false);

      if (ok && data.success) {
        setConversionInfo({
          rate:            data.rate,
          convertedAmount: data.converted_amount,
          fromCode:        fromCode.toUpperCase(),
          toCode:          toCode.toUpperCase(),
        });
      } else {
        // Check for specific error messages
        if (data?.message?.includes('Currency conversion not supported')) {
          setConversionInfo({
            rate:            0, // Indicate manual conversion needed
            convertedAmount: 0,
            fromCode:        fromCode.toUpperCase(),
            toCode:          toCode.toUpperCase(),
            manualRequired: true,
          });
        } else {
          // For any other failure (network error, API down, etc.), also allow manual entry
          setConversionInfo({
            rate:            0,
            convertedAmount: 0,
            fromCode:        fromCode.toUpperCase(),
            toCode:          toCode.toUpperCase(),
            manualRequired: true,
            apiFailed:       true,
          });
        }
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [form.account_id, form.amount]);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setApiError("");
  };

  // ── Submit is blocked if cross-currency and rate not ready ──
  const submitBlocked = isCrossCurrency && (
    rateLoading ||
    (!conversionInfo?.manualRequired && rateFailed) ||
    !conversionInfo ||
    (conversionInfo.manualRequired && (!form.converted_amount || parseFloat(form.converted_amount) <= 0))
  );

  const handleSubmit = async () => {
    if (submitBlocked) return;
    setSaving(true);

    const payload = {
      account_id: form.account_id,
      amount: form.amount,
      contribution_date: form.contribution_date,
      description: form.description,
      goal_id: goal.goal_id,
    };

    // Only include converted_amount if cross-currency
    if (isCrossCurrency) {
      payload.converted_amount = conversionInfo?.manualRequired
        ? form.converted_amount
        : conversionInfo?.convertedAmount;
    }

    const result = await GoalsBLL.addContribution(payload);

    if (!result.success) {
      if (result.validationErrors) setErrors(result.validationErrors);
      else setApiError(result.error);
      setSaving(false);
      return;
    }

    // ── Notify parent and close modal ──
    onContributed({
      convertedAmount: isCrossCurrency && conversionInfo.manualRequired
        ? parseFloat(form.converted_amount)
        : isCrossCurrency
        ? conversionInfo.convertedAmount
        : parseFloat(form.amount),
      originalAmount: parseFloat(form.amount),
      accountId:      parseInt(form.account_id),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      title="Add Contribution"
      description={`Contributing towards: ${goal.goal_name}`}
      onClose={onClose}
      size="md"
    >
      <div className="px-6 pb-2 space-y-1">

        {/* ── Remaining hint ── */}
        <div className="bg-skin-secondary border border-skin-border rounded-xl px-4 py-3 mb-3">
          <p className="text-xs text-skin-text-muted">Remaining to reach goal</p>
          <p className="text-lg font-bold text-emerald-500 mt-0.5">
            {goal.currency_symbol}{formatNumber(remaining)}
          </p>
        </div>

        {/* ── Account selector ── */}
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

        {/* ── Manual converted amount input ── */}
        {isCrossCurrency && conversionInfo && conversionInfo.manualRequired && (
          <Input
            id="converted_amount"
            label={`Amount to credit to goal (${goal.currency_code})`}
            type="number"
            placeholder="0.00"
            value={form.converted_amount || ""}
            onChange={handle("converted_amount")}
            error={errors.converted_amount}
            helper={`Enter how much ${goal.currency_code} should be added to the goal`}
          />
        )}

        {/* ── Conversion preview panel ── */}
        {isCrossCurrency && form.amount && parseFloat(form.amount) > 0 && (
          <div className={`rounded-xl border px-4 py-3 mb-1 transition-all duration-200 ${
            rateFailed
              ? "bg-red-500/10 border-red-500/30"
              : "bg-skin-secondary border-skin-border"
          }`}>
            {rateLoading && (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <p className="text-xs text-skin-text-muted">Fetching live rate…</p>
              </div>
            )}

            {!rateLoading && rateFailed && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-red-500">
                  {conversionInfo?.apiFailed 
                    ? "Exchange rate service unavailable. Please enter the converted amount manually."
                    : "Currency conversion not supported. Please enter the converted amount manually."
                  }
                </p>
              </div>
            )}

            {!rateLoading && !rateFailed && conversionInfo && !conversionInfo.manualRequired && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-skin-text-muted">Live conversion</p>
                  <span className="text-xs text-skin-text-muted">ECB rate</span>
                </div>
                <p className="text-sm font-semibold text-skin-text">
                  {formatNumber(form.amount)} {conversionInfo.fromCode}
                  {" → "}
                  <span className="text-emerald-500">
                    {formatNumber(conversionInfo.convertedAmount)} {conversionInfo.toCode}
                  </span>
                </p>
                <p className="text-xs text-skin-text-muted mt-1">
                  1 {conversionInfo.fromCode} = {formatNumber(conversionInfo.rate, 4)} {conversionInfo.toCode}
                </p>
              </div>
            )}

            {!rateLoading && !rateFailed && conversionInfo && conversionInfo.manualRequired && !conversionInfo.apiFailed && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-amber-600 font-medium">Manual conversion required</p>
                </div>
                <p className="text-xs text-skin-text-muted">
                  Live rates not available for {conversionInfo.fromCode} to {conversionInfo.toCode}.
                  Please enter the amount that should be credited to the goal.
                </p>
              </div>
            )}

            {!rateLoading && !rateFailed && conversionInfo && conversionInfo.manualRequired && conversionInfo.apiFailed && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-orange-600 font-medium">Live rates unavailable</p>
                </div>
                <p className="text-xs text-skin-text-muted">
                  Could not fetch live exchange rates. Please enter the converted amount manually.
                </p>
              </div>
            )}
          </div>
        )}

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
        <Button
          variant="primary"
          className="flex-1"
          loading={saving}
          disabled={submitBlocked}
          onClick={handleSubmit}
        >
          {isCrossCurrency && rateLoading
            ? "Fetching rate…"
            : "Add Contribution"
          }
        </Button>
      </div>
    </Modal>
  );
}