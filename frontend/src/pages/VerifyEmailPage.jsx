import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

// ── DAL ──
class VerifyEmailDAL {
  static async verify(email, code) {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", email, code }),
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async resend(email) {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend", email }),
    });
    return { ok: res.ok, data: await res.json() };
  }
}

export default function VerifyEmailPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { login }     = useUser();

  // Email comes from query param: /verify-email?email=...
  const email = new URLSearchParams(location.search).get("email") || "";

  // 6 individual digit slots
  const [digits, setDigits]     = useState(["", "", "", "", "", ""]);
  const inputRefs               = useRef([]);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Resend cooldown (60 seconds)
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef             = useRef(null);

  // Redirect away if no email in URL
  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // ── Digit input handlers ──
  const handleDigitChange = (index, value) => {
    // Accept only single digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    // Move focus forward
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5) {
      const full = [...next].join("");
      if (full.length === 6) handleVerify(full);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    setError("");
    // Focus the next empty slot or the last one
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  };

  // ── Verify ──
  const handleVerify = async (codeOverride) => {
    const code = codeOverride ?? digits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const { ok, data } = await VerifyEmailDAL.verify(email, code);

    if (data.success) {
      setIsVerified(true);
      setSuccess("Email verified! Redirecting…");
      login(data.user);
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    } else {
      setError(data.message || "Verification failed. Please try again.");
      // Clear the digits on wrong code so user can retype cleanly
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }

    setLoading(false);
  };

  // ── Resend ──
  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setSuccess("");

    const { data } = await VerifyEmailDAL.resend(email);

    if (data.success) {
      setSuccess("A new code has been sent to your email.");
      // Start 60-second cooldown
      setCooldown(60);
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(data.message || "Could not resend the code. Please try again.");
    }
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
            One last step.
            <br />
            <span className="text-emerald-500">Verify your email.</span>
          </h1>
          <p className="text-skin-text-secondary text-base leading-relaxed max-w-sm">
            We sent a 6-digit code to your inbox. Enter it to activate your account and get started.
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

          <div className="bg-skin-card border border-skin-border rounded-2xl p-8 shadow-sm">

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-skin-text mb-1">Check your email</h2>
            <p className="text-skin-text-muted text-sm mb-7">
              We sent a 6-digit verification code to{" "}
              <span className="text-skin-text font-medium">{email}</span>.
              The code expires in 15 minutes.
            </p>

            {/* Feedback messages */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {/* 6-digit input */}
            <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  autoFocus={i === 0}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading || isVerified}
                  className={`
                    w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-xl
                    border bg-skin-input text-skin-text
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50
                    transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error
                      ? "border-red-500/50"
                      : d
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-skin-border"
                    }
                  `}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || isVerified || digits.join("").length < 6}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-sm font-semibold
                bg-emerald-500 hover:bg-emerald-400 text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150 mb-4
              "
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  Verify Email
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Resend */}
            <div className="text-center text-sm text-skin-text-muted">
              Didn't receive a code?{" "}
              {cooldown > 0 ? (
                <span className="text-skin-text-secondary">
                  Resend in {cooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors duration-150"
                >
                  Resend code
                </button>
              )}
            </div>

          </div>

          <p className="text-center text-skin-text-muted text-xs mt-4">
            Wrong email?{" "}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Go back and register again
            </Link>
          </p>

          <p className="text-center text-skin-text-muted text-xs mt-2">
            ©️ {new Date().getFullYear()} FinHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}