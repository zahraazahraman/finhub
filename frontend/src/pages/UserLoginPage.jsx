import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

class UserAuthDAL {
  static async loginRequest(email, password) {
    // Detect the device timezone and include it so the backend can store it.
    // This ensures bill reminders and date logic always use the user's local time.
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const res = await fetch("/api/auth/user-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, timezone }),
    });
    return { ok: res.ok, data: await res.json() };
  }
}

class UserAuthBLL {
  static validate(email, password) {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    return errors;
  }

  static async login(email, password) {
    const validationErrors = this.validate(email, password);
    if (Object.keys(validationErrors).length > 0)
      return { success: false, validationErrors };
    try {
      const { ok, data } = await UserAuthDAL.loginRequest(email, password);
      if (ok && data.success)
        return { success: true, user: data.user };
      if (!ok && data.needs_verification)
        return { success: false, needsVerification: true, email: data.email, serverError: data.message };
      return { success: false, serverError: data.message || "Invalid credentials." };
    } catch {
      return { success: false, serverError: "Network error. Please try again." };
    }
  }
}

export default function UserLoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useUser();

  const params         = new URLSearchParams(location.search);
  const justRegistered = params.get("registered");
  const justReset      = params.get("reset");

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setFieldErrors({});
    setLoading(true);

    const result = await UserAuthBLL.login(email, password);

    if (result.success) {
      login(result.user);
      navigate("/dashboard");
    } else if (result.needsVerification) {
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } else if (result.validationErrors) {
      setFieldErrors(result.validationErrors);
    } else {
      setServerError(result.serverError);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-skin-base flex transition-colors duration-200">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <span className="text-skin-text text-xl font-bold">Fin</span>
            <span className="text-emerald-500 text-xl font-bold">Hub</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-skin-text leading-tight mb-4">
            See where your money goes.
            <br />
            <span className="text-emerald-500">Know where it grows.</span>
          </h1>
          <p className="text-skin-text-secondary text-base leading-relaxed max-w-sm">
            Welcome back! Your financial journey continues here.
          </p>
        </div>

        <p className="text-skin-text-muted text-xs relative z-10">
          FinHub · Your smart financial companion
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-skin-text text-xl font-bold">Fin</span>
            <span className="text-emerald-500 text-xl font-bold">Hub</span>
          </div>

          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold text-skin-text mb-1">Welcome back</h2>
            <p className="text-skin-text-muted text-sm mb-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors duration-150">
                Create one for free
              </Link>
            </p>

            {justReset === "success" && (
              <div className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Password reset successfully! Please sign in with your new password.
              </div>
            )}

            {justRegistered && (
              <div className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Account created successfully! Please sign in.
              </div>
            )}

            {serverError && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Input
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                placeholder="zahraa@example.com"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              />
              <Input
                id="password"
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                placeholder="••••••••"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />

              <div className="flex items-center justify-end mb-7">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors duration-150"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </Card>

          <p className="text-center text-skin-text-muted text-xs mt-6">
            ©️ {new Date().getFullYear()} FinHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}