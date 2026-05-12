import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../utils/api.js";

function PasswordInput({ id, label, value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-skin-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-skin-text-muted pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-skin-input border rounded-xl pl-10 py-3 pr-11
            text-skin-text placeholder-skin-text-muted text-sm
            focus:outline-none focus:ring-2 transition-all duration-150
            ${error
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-skin-border focus:ring-emerald-500/40 focus:border-emerald-500/50"
            }
          `}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-skin-text-muted hover:text-skin-text transition-colors duration-150"
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
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

export default function ResetPasswordPage({ role = "user" }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAdmin   = role === "admin";
  const endpoint  = isAdmin ? "/auth/admin-reset-password" : "/auth/reset-password";
  const loginPath = isAdmin ? "/admin/login" : "/login";

  const token = new URLSearchParams(location.search).get("token") || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]     = useState(false);

  // No token in URL — malformed link.
  if (!token) {
    return (
      <div className="min-h-screen bg-skin-base flex items-center justify-center px-4 transition-colors duration-200">
        <div className="w-full max-w-md">
          <div className="bg-skin-card border border-skin-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-skin-text mb-2">Invalid link</h2>
            <p className="text-skin-text-muted text-sm mb-6">
              This password reset link is missing or malformed. Please request a new one.
            </p>
            <Link
              to={isAdmin ? "/admin/forgot-password" : "/forgot-password"}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors duration-150"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    setLoading(true);
    const { ok, data } = await api.post(endpoint, { token, password, confirm });
    setLoading(false);

    if (ok && data.success) {
      navigate(`${loginPath}?reset=success`);
    } else {
      setServerError(data.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-skin-base flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 opacity-30" />
            <div className="absolute inset-0 bg-emerald-400 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-skin-text text-xl font-bold">Fin</span>
              <span className="text-emerald-500 text-xl font-bold">Hub</span>
            </div>
            {isAdmin && (
              <div className="text-skin-text-muted text-[10px] uppercase tracking-widest font-medium -mt-0.5">
                Admin Portal
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-skin-card border border-skin-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-skin-text mb-1">Set a new password</h2>
          <p className="text-skin-text-muted text-sm mb-8">
            Choose a strong password — at least 6 characters.
          </p>

          {serverError && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <PasswordInput
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
              error={errors.password}
              placeholder="••••••••"
            />
            <PasswordInput
              id="confirm"
              label="Confirm Password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" })); }}
              error={errors.confirm}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-semibold text-sm rounded-xl py-3 mt-2 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  Reset Password
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            to={loginPath}
            className="inline-flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-400 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to {isAdmin ? "Admin " : ""}Sign In
          </Link>
        </div>

        <p className="text-center text-skin-text-muted text-xs mt-4">
          © {new Date().getFullYear()} FinHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}