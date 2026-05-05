import { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ProfileBLL from "../bll/ProfileBLL.js";

// ── Reusable sub-components ────────────────────────────────────────────────

function SectionCard({ title, description, icon, children }) {
  return (
    <div className="bg-skin-card border border-skin-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-skin-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-skin-text text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-skin-text-muted text-xs mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-skin-text-secondary text-xs font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="
          w-full px-3 py-2.5 rounded-xl text-sm
          bg-skin-input border border-skin-border
          text-skin-text placeholder:text-skin-text-muted
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
          transition-all duration-150
        "
      />
    </div>
  );
}

function FeedbackMessage({ type, message }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
      ${isError
        ? "bg-red-500/10 border border-red-500/20 text-red-400"
        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
      }
    `}>
      {isError ? (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

function SaveButton({ loading, label = "Save Changes" }) {
  return (
    <button
      type="button"
      disabled={loading}
      className="
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
        bg-emerald-500 hover:bg-emerald-400 text-white
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >
      {loading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Saving…
        </>
      ) : label}
    </button>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative flex-shrink-0 mt-0.5 w-10 h-5 rounded-full border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          ${checked
            ? "bg-emerald-500 border-emerald-500"
            : "bg-skin-hover border-skin-border"
          }
        `}
      >
        <span className={`
          absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
          transition-all duration-200
          ${checked ? "left-5" : "left-0.5"}
        `} />
      </button>
      <div>
        <p className="text-skin-text text-sm font-medium">{label}</p>
        {description && (
          <p className="text-skin-text-muted text-xs mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

// ── Tone selector ──────────────────────────────────────────────────────────
function ToneOption({ value, current, onChange, title, subtitle, icon }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`
        flex-1 flex flex-col items-start gap-2 p-4 rounded-xl border text-left
        transition-all duration-150
        ${active
          ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
          : "bg-skin-hover border-skin-border hover:border-skin-text-secondary"
        }
      `}
    >
      <div className={`text-xl ${active ? "text-emerald-500" : "text-skin-text-secondary"}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${active ? "text-emerald-500" : "text-skin-text"}`}>
          {title}
        </p>
        <p className="text-skin-text-muted text-xs mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {active && (
        <div className="ml-auto self-end">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useUser();
  const { theme, toggleTheme } = useTheme();

  // ── Profile data from server ──
  const [currencies, setCurrencies]   = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Name form ──
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [nameSaving,  setNameSaving]  = useState(false);
  const [nameFeedback, setNameFeedback] = useState(null); // { type, message }

  // ── Password form ──
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwFeedback, setPwFeedback] = useState(null);

  // ── Preferences ──
  const [preferredCurrencyId,  setPreferredCurrencyId]  = useState(1);
  const [aiTone,               setAiTone]               = useState("professional");
  const [aiDataSharing,        setAiDataSharing]        = useState(true);
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(true);
  const [prefSaving,   setPrefSaving]   = useState(false);
  const [prefFeedback, setPrefFeedback] = useState(null);

  // ── Load profile + currencies on mount ──
  const loadData = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [profileRes, currRes] = await Promise.all([
        ProfileBLL.getProfile(),
        fetch("/api/currencies", { credentials: "include" }).then((r) => r.json()),
      ]);

      if (profileRes.success) {
        const p = profileRes.profile;
        setFirstName(p.first_name ?? "");
        setLastName(p.last_name  ?? "");
        setPreferredCurrencyId(p.preferred_currency_id ?? 1);
        setAiTone(p.ai_tone ?? "professional");
        setAiDataSharing(!!+p.ai_data_sharing);
        setWeeklySummaryEnabled(!!+p.weekly_summary_enabled);
      }

      if (currRes.success && Array.isArray(currRes.currencies)) {
        setCurrencies(currRes.currencies);
      }
    } catch {
      // fail silently — user will see empty form
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ──

  const handleNameSave = async () => {
    setNameSaving(true);
    setNameFeedback(null);
    const res = await ProfileBLL.updateName(firstName, lastName);
    setNameFeedback({ type: res.success ? "success" : "error", message: res.message });
    if (res.success) {
      updateUser({ first_name: res.first_name, last_name: res.last_name });
    }
    setNameSaving(false);
  };

  const handlePasswordSave = async () => {
    setPwSaving(true);
    setPwFeedback(null);
    const res = await ProfileBLL.updatePassword(currentPw, newPw, confirmPw);
    setPwFeedback({ type: res.success ? "success" : "error", message: res.message });
    if (res.success) {
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }
    setPwSaving(false);
  };

  const handlePrefSave = async () => {
    setPrefSaving(true);
    setPrefFeedback(null);
    const res = await ProfileBLL.updatePreferences({
      preferred_currency_id:  preferredCurrencyId,
      ai_tone:                aiTone,
      ai_data_sharing:        aiDataSharing ? 1 : 0,
      weekly_summary_enabled: weeklySummaryEnabled ? 1 : 0,
    });
    setPrefFeedback({ type: res.success ? "success" : "error", message: res.message });
    if (res.success) {
      updateUser({
        preferred_currency_id:  res.preferred_currency_id,
        ai_tone:                res.ai_tone,
        ai_data_sharing:        res.ai_data_sharing,
        weekly_summary_enabled: res.weekly_summary_enabled,
      });
    }
    setPrefSaving(false);
  };

  // ── Loading skeleton ──
  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-skin-card border border-skin-border rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* ── Page header ── */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-emerald-500 text-lg font-bold">
            {user?.first_name?.[0]?.toUpperCase() ?? "U"}
          </span>
        </div>
        <div>
          <h1 className="text-skin-text font-bold text-lg">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-skin-text-muted text-xs">{user?.email}</p>
        </div>
      </div>

      {/* ── 1. Name ── */}
      <SectionCard
        title="Full Name"
        description="Update how your name appears across FinHub."
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              placeholder="First name"
              autoComplete="given-name"
            />
            <InputField
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
          <div className="flex items-center justify-between">
            <FeedbackMessage type={nameFeedback?.type} message={nameFeedback?.message} />
            <div className="ml-auto" onClick={handleNameSave}>
              <SaveButton loading={nameSaving} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Password ── */}
      <SectionCard
        title="Change Password"
        description="Use a strong password of at least 8 characters."
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      >
        <div className="space-y-4">
          <InputField
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="New Password"
              type="password"
              value={newPw}
              onChange={setNewPw}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center justify-between">
            <FeedbackMessage type={pwFeedback?.type} message={pwFeedback?.message} />
            <div className="ml-auto" onClick={handlePasswordSave}>
              <SaveButton loading={pwSaving} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 3. Appearance ── */}
      <SectionCard
        title="Appearance"
        description="Choose how FinHub looks on your device."
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-skin-text text-sm font-medium">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-skin-text-muted text-xs mt-0.5">
              {theme === "dark"
                ? "Easy on the eyes in low-light environments."
                : "Clear and bright for well-lit environments."}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
              bg-skin-hover border border-skin-border
              text-skin-text hover:border-emerald-500/40
              transition-all duration-150
            "
          >
            {theme === "dark" ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                Switch to Light
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Switch to Dark
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* ── 4. Preferences (currency + AI) ── */}
      <SectionCard
        title="Preferences"
        description="Currency, AI behaviour, and notification settings."
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        }
      >
        <div className="space-y-6">

          {/* Preferred currency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-skin-text-secondary text-xs font-medium">
              Preferred Currency
            </label>
            <p className="text-skin-text-muted text-xs -mt-1 mb-1">
              Used as the default currency when creating new accounts and goals.
            </p>
            <select
              value={preferredCurrencyId}
              onChange={(e) => setPreferredCurrencyId(Number(e.target.value))}
              className="
                w-full px-3 py-2.5 rounded-xl text-sm
                bg-skin-input border border-skin-border
                text-skin-text
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                transition-all duration-150
              "
            >
              {currencies.map((c) => (
                <option key={c.currency_id} value={c.currency_id}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-skin-border" />

          {/* AI tone */}
          <div className="space-y-2">
            <p className="text-skin-text-secondary text-xs font-medium">AI Language Style</p>
            <p className="text-skin-text-muted text-xs">
              Controls how the AI consultant and investment analysis speak to you.
            </p>
            <div className="flex gap-3 mt-3">
              <ToneOption
                value="simple"
                current={aiTone}
                onChange={setAiTone}
                icon="💬"
                title="Simple"
                subtitle="Plain language, no jargon. Every term is explained. Great for beginners."
              />
              <ToneOption
                value="professional"
                current={aiTone}
                onChange={setAiTone}
                icon="📊"
                title="Professional"
                subtitle="Standard financial terminology. Concise and data-driven."
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-skin-border" />

          {/* AI data sharing */}
          <Toggle
            checked={aiDataSharing}
            onChange={setAiDataSharing}
            label="Share my financial data with the AI"
            description="When enabled, the AI consultant receives your accounts, balances, goals, and investments to give you personalised advice. When disabled, the AI still works but gives general guidance only — without seeing any of your numbers."
          />

          {/* Divider */}
          <div className="border-t border-skin-border" />

          {/* Weekly summary email */}
          <Toggle
            checked={weeklySummaryEnabled}
            onChange={setWeeklySummaryEnabled}
            label="Receive weekly summary emails"
            description="A brief email every week showing your overall balances, income, and expenses across all accounts."
          />

          {/* Save preferences */}
          <div className="flex items-center justify-between pt-1">
            <FeedbackMessage type={prefFeedback?.type} message={prefFeedback?.message} />
            <div className="ml-auto" onClick={handlePrefSave}>
              <SaveButton loading={prefSaving} label="Save Preferences" />
            </div>
          </div>

        </div>
      </SectionCard>

    </div>
  );
}