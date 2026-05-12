import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

export default function ForgotPasswordPage({ role = "user" }) {
  const isAdmin   = role === "admin";
  const endpoint  = isAdmin ? "/auth/admin-forgot-password" : "/auth/forgot-password";
  const loginPath = isAdmin ? "/admin/login" : "/login";

  const [email, setEmail]         = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [networkError, setNetworkError] = useState("");

  const validate = (value) => {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNetworkError("");

    const err = validate(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");

    setLoading(true);
    const { status } = await api.post(endpoint, { email: email.trim() });
    setLoading(false);

    if (status === 0) {
      setNetworkError("Network error. Please check your connection and try again.");
      return;
    }

    // Show "sent" state regardless of whether email exists — prevents enumeration.
    setSent(true);
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
            <div className="flex items-baseline gap-0">
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
          {!sent ? (
            <>
              <h2 className="text-xl font-semibold text-skin-text mb-1">Forgot your password?</h2>
              <p className="text-skin-text-muted text-sm mb-8">
                Enter your email and we'll send you a link to reset it.
              </p>

              {networkError && (
                <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {networkError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email field */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-skin-text-secondary mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-skin-text-muted pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                      placeholder="you@example.com"
                      className={`
                        w-full bg-skin-input border rounded-xl pl-10 py-3 pr-4
                        text-skin-text placeholder-skin-text-muted text-sm
                        focus:outline-none focus:ring-2 transition-all duration-150
                        ${emailError
                          ? "border-red-500/60 focus:ring-red-500/30"
                          : "border-skin-border focus:ring-emerald-500/40 focus:border-emerald-500/50"
                        }
                      `}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-semibold text-sm rounded-xl py-3 transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Sent state ── */
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-skin-text mb-2">Check your inbox</h2>
              <p className="text-skin-text-muted text-sm leading-relaxed mb-6">
                If this email is registered, a reset link has been sent. The link expires in{" "}
                <strong className="text-skin-text">1 hour</strong>. Don't forget to check your spam folder.
              </p>
              <p className="text-sm text-skin-text-muted">
                Didn't receive anything?{" "}
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-emerald-500 hover:text-emerald-400 transition-colors duration-150 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          )}
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