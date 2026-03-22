import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// ── DAL ──
class RegisterDAL {
  static async registerRequest(payload) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, data: await res.json() };
  }
}

// ── BLL ──
class RegisterBLL {
  static validate({ first_name, last_name, email, password, confirm_password }) {
    const errors = {};
    if (!first_name.trim())  errors.first_name = "First name is required.";
    if (!last_name.trim())   errors.last_name  = "Last name is required.";
    if (!email.trim())       errors.email      = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password)           errors.password   = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!confirm_password)   errors.confirm_password = "Please confirm your password.";
    else if (password !== confirm_password)
      errors.confirm_password = "Passwords do not match.";
    return errors;
  }

  static async register(payload) {
    const validationErrors = this.validate(payload);
    if (Object.keys(validationErrors).length > 0)
      return { success: false, validationErrors };
    try {
      const { ok, data } = await RegisterDAL.registerRequest(payload);
      if (ok && data.success) return { success: true, user: data.user };
      return { success: false, serverError: data.message || "Registration failed." };
    } catch {
      return { success: false, serverError: "Network error. Please try again." };
    }
  }
}

// ── UI Components ──
function InputField({ id, label, type = "text", value, onChange, error, placeholder, icon, optional }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-1.5">
        {label}
        {optional && <span className="text-slate-600 text-xs ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-slate-800/60 border rounded-xl pl-10 py-3 pr-4
            text-slate-100 placeholder-slate-600 text-sm
            focus:outline-none focus:ring-2 transition-all duration-200
            ${error
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-slate-700 focus:ring-emerald-500/40 focus:border-emerald-500/50"
            }
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Component ──
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name:       "",
    last_name:        "",
    email:            "",
    password:         "",
    confirm_password: "",
    phone:            "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setFieldErrors({});
    setLoading(true);

    const result = await RegisterBLL.register(form);

    if (result.success) {
      navigate("/login?registered=true");
    } else if (result.validationErrors) {
      setFieldErrors(result.validationErrors);
    } else {
      setServerError(result.serverError);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
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
            <span className="text-white text-xl font-bold tracking-tight">Fin</span>
            <span className="text-emerald-400 text-xl font-bold tracking-tight">Hub</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            See where your money goes.
            <br />
            <span className="text-emerald-400">Know where it grows.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Join FinHub and take full control of your finances — for free.
          </p>

          {/* Benefits */}
          <div className="mt-10 space-y-3">
            {[
              "Track all your accounts in one place",
              "Set and achieve financial goals",
              "AI-powered investment insights",
              "Connect with financial consultants",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs relative z-10">
          FinHub · Your smart financial companion
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-white text-xl font-bold">Fin</span>
            <span className="text-emerald-400 text-xl font-bold">Hub</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
            <p className="text-slate-500 text-sm mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign in
              </Link>
            </p>

            {serverError && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="first_name"
                  label="First Name"
                  value={form.first_name}
                  onChange={handle("first_name")}
                  error={fieldErrors.first_name}
                  placeholder="Zahraa"
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
                <InputField
                  id="last_name"
                  label="Last Name"
                  value={form.last_name}
                  onChange={handle("last_name")}
                  error={fieldErrors.last_name}
                  placeholder="Zahraman"
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
              </div>

              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handle("email")}
                error={fieldErrors.email}
                placeholder="zahraa@example.com"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              />

              <InputField
                id="phone"
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={handle("phone")}
                error={fieldErrors.phone}
                placeholder="70123456"
                optional
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              />

              <InputField
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={handle("password")}
                error={fieldErrors.password}
                placeholder="••••••••"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <InputField
                id="confirm_password"
                label="Confirm Password"
                type="password"
                value={form.confirm_password}
                onChange={handle("confirm_password")}
                error={fieldErrors.confirm_password}
                placeholder="••••••••"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-900 disabled:text-slate-700 font-semibold text-sm rounded-xl py-3 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            © {new Date().getFullYear()} FinHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}