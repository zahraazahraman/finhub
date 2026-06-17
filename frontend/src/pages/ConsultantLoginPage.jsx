import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useConsultantAuth } from "../context/ConsultantAuthContext.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";

function FinHubLogo() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="relative w-10 h-10 flex-shrink-0">
        <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 opacity-30" />
        <div className="absolute inset-0 bg-emerald-400 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
      </div>
      <div>
        <span className="text-skin-text text-xl font-bold tracking-tight">Fin</span>
        <span className="text-emerald-500 text-xl font-bold tracking-tight">Hub</span>
        <div className="text-skin-text-muted text-[10px] uppercase tracking-widest font-medium -mt-0.5">
          Consultant Portal
        </div>
      </div>
    </div>
  );
}

function InputField({ id, label, type = "text", value, onChange, error, placeholder, icon }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-skin-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-skin-text-muted pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-skin-input border rounded-xl pl-10 py-3 pr-10 text-skin-text placeholder-skin-text-muted text-sm focus:outline-none focus:ring-2 transition-all duration-150 ${
            error
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-skin-border focus:ring-emerald-500/40 focus:border-emerald-500/50"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-skin-text-muted hover:text-skin-text transition-colors"
          >
            {showPassword ? (
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
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default function ConsultantLoginPage() {
  const navigate        = useNavigate();
  const { login }       = useConsultantAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/consultant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        login(data.consultant);
        if (data.must_change_password) {
          navigate("/consultant/change-password", { replace: true });
        } else {
          navigate("/consultant/dashboard", { replace: true });
        }
      } else {
        setServerError(data.message || "Invalid credentials.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Consultant | Sign In | FinHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="min-h-screen bg-skin-base flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="bg-skin-card border border-skin-border rounded-2xl p-8 animate-fade-in"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <FinHubLogo />

            <h1 className="text-skin-text text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-skin-text-secondary text-sm mb-8">
              Sign in to your consultant account.
            </p>

            {serverError && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <InputField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all duration-150 text-sm disabled:opacity-60 mt-1"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/consultant/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors duration-150">
                Forgot your password?
              </Link>
            </div>

            <p className="text-center text-skin-text-muted text-xs mt-4">
              Not a consultant?{" "}
              <Link to="/" className="text-emerald-500 hover:underline">Go to FinHub</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
