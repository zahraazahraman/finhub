import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import api from "../utils/api.js";
import { validators, validateForm } from "../utils/validators.js";

// ── DAL ──
class RegisterDAL {
  static async registerRequest(payload) {
    return await api.post("/auth/register", payload);
  }
}

// ── BLL ──
class RegisterBLL {
  static validate({ first_name, last_name, email, password, confirm_password }) {
    return validateForm({
      first_name:       validators.required(first_name, "First name"),
      last_name:        validators.required(last_name, "Last name"),
      email:            validators.required(email, "Email") ||
                        validators.email(email),
      password:         validators.required(password, "Password") ||
                        validators.minLength(password, 6, "Password"),
      confirm_password: validators.required(confirm_password, "Confirm password") ||
                        validators.match(password, confirm_password, "Passwords"),
    });
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    password: "", confirm_password: "", phone: "",
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

  const emailIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const userIcon  = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const phoneIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const lockIcon  = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

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

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-skin-text leading-tight mb-4">
            See where your money goes.
            <br />
            <span className="text-emerald-500">Know where it grows.</span>
          </h1>
          <p className="text-skin-text-secondary text-base leading-relaxed max-w-sm">
            Join FinHub and take full control of your finances — for free.
          </p>
          <div className="mt-10 space-y-3">
            {[
              "Track all your accounts in one place",
              "Set and achieve financial goals",
              "AI-powered investment insights",
              "Connect with financial consultants",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-skin-text-secondary text-sm">{benefit}</span>
              </div>
            ))}
          </div>
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

          <Card padding="lg">
            <h2 className="text-xl font-semibold text-skin-text mb-1">Create your account</h2>
            <p className="text-skin-text-muted text-sm mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors duration-150">
                Sign in
              </Link>
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
              <div className="grid grid-cols-2 gap-3">
                <Input id="first_name" label="First Name" value={form.first_name} onChange={handle("first_name")} error={fieldErrors.first_name} placeholder="Zahraa" icon={userIcon} />
                <Input id="last_name" label="Last Name" value={form.last_name} onChange={handle("last_name")} error={fieldErrors.last_name} placeholder="Zahraman" icon={userIcon} />
              </div>
              <Input id="email" label="Email Address" type="email" value={form.email} onChange={handle("email")} error={fieldErrors.email} placeholder="zahraa@example.com" icon={emailIcon} />
              <Input id="phone" label="Phone Number" type="tel" value={form.phone} onChange={handle("phone")} error={fieldErrors.phone} placeholder="70123456" icon={phoneIcon} optional />
              <Input id="password" label="Password" type="password" value={form.password} onChange={handle("password")} error={fieldErrors.password} placeholder="••••••••" icon={lockIcon} />
              <Input id="confirm_password" label="Confirm Password" type="password" value={form.confirm_password} onChange={handle("confirm_password")} error={fieldErrors.confirm_password} placeholder="••••••••" icon={lockIcon} />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                }
              >
                Create Account
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