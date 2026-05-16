import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultantAuth } from "../context/ConsultantAuthContext.jsx";

export default function ConsultantChangePasswordPage() {
  const navigate                  = useNavigate();
  const { consultant, clearMustChange } = useConsultantAuth();
  const [newPassword, setNewPassword]   = useState("");
  const [confirm, setConfirm]           = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/consultant-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        clearMustChange();
        navigate("/consultant/dashboard", { replace: true });
      } else {
        setError(data.message || "Failed to update password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-skin-base flex items-center justify-center px-4">
      <div
        className="bg-skin-card border border-skin-border rounded-2xl p-8 w-full max-w-md animate-fade-in"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="text-skin-text text-xl font-bold mb-1">Set your password</h1>
        <p className="text-skin-text-secondary text-sm mb-6">
          Hi {consultant?.first_name}, you're signing in for the first time. Please set a permanent password to continue.
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-skin-input border border-skin-border rounded-xl px-4 py-3 text-skin-text text-sm placeholder-skin-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-skin-input border border-skin-border rounded-xl px-4 py-3 text-skin-text text-sm placeholder-skin-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60 mt-2"
          >
            {loading ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
