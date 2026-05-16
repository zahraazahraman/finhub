import { useState, useEffect } from "react";
import { useConsultantAuth } from "../context/ConsultantAuthContext.jsx";
import api from "../utils/api.js";

function StatCard({ label, value, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    yellow:  "bg-yellow-500/10 text-yellow-500",
    slate:   "bg-skin-hover text-skin-text-muted",
    blue:    "bg-blue-500/10 text-blue-400",
  };
  return (
    <div className="bg-skin-card border border-skin-border rounded-2xl p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${colors[color]}`}>
        <span className="text-lg font-bold">{value ?? "—"}</span>
      </div>
      <p className="text-skin-text-muted text-xs uppercase tracking-wide">{label}</p>
    </div>
  );
}

function ProfileEditModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name:       profile.first_name       ?? "",
    last_name:        profile.last_name        ?? "",
    phone:            profile.phone            ?? "",
    specialization:   profile.specialization   ?? "",
    years_experience: profile.years_experience ?? "",
    bio:              profile.bio              ?? "",
  });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const { ok, data } = await api.put("/consultant-profile", form);
    setLoading(false);
    if (ok && data.success) { onSaved(data.updated); }
    else { setError(data?.message || "Failed to save."); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-skin-card border border-skin-border rounded-2xl w-full max-w-lg animate-scale-in" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-skin-border">
          <h2 className="text-skin-text font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="text-skin-text-muted hover:text-skin-text transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[["first_name", "First name"], ["last_name", "Last name"]].map(([name, label]) => (
              <div key={name}>
                <label className="block text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">{label}</label>
                <input
                  name={name} value={form[name]} onChange={handle}
                  className="w-full bg-skin-input border border-skin-border rounded-xl px-3 py-2.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Phone</label>
              <input
                name="phone" value={form.phone} onChange={handle}
                className="w-full bg-skin-input border border-skin-border rounded-xl px-3 py-2.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Years of experience</label>
              <input
                name="years_experience" type="number" min="0" value={form.years_experience} onChange={handle}
                className="w-full bg-skin-input border border-skin-border rounded-xl px-3 py-2.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Specialization</label>
            <input
              name="specialization" value={form.specialization} onChange={handle}
              className="w-full bg-skin-input border border-skin-border rounded-xl px-3 py-2.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Bio</label>
            <textarea
              name="bio" rows={4} value={form.bio} onChange={handle}
              className="w-full bg-skin-input border border-skin-border rounded-xl px-3 py-2.5 text-skin-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-skin-border text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultantDashboard() {
  const { consultant, login } = useConsultantAuth();
  const [stats, setStats]     = useState(null);
  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    api.get("/consultant-inquiries?stats=1").then(({ ok, data }) => {
      if (ok && data.success) setStats(data.stats);
    });
    api.get("/consultant-profile").then(({ ok, data }) => {
      if (ok && data.success) setProfile(data.profile);
    });
  }, []);

  const handleProfileSaved = (updated) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    // Keep auth context in sync (sidebar name/spec)
    login({ ...consultant, ...updated });
    setEditOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-skin-text font-bold text-xl">
            Welcome, {consultant?.first_name}
          </h1>
          <p className="text-skin-text-secondary text-sm mt-0.5">
            {consultant?.specialization} · here's your activity at a glance.
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-skin-card border border-skin-border rounded-xl text-sm text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total inquiries" value={stats?.total}     color="blue" />
        <StatCard label="Pending"          value={stats?.pending}   color="yellow" />
        <StatCard label="Replied"          value={stats?.responded} color="emerald" />
        <StatCard label="Closed"           value={stats?.closed}    color="slate" />
      </div>

      {/* Profile card */}
      {profile && (
        <div className="bg-skin-card border border-skin-border rounded-2xl p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-4">Profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-skin-text-muted text-xs mb-0.5">Name</p>
              <p className="text-skin-text font-medium">{profile.first_name} {profile.last_name}</p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs mb-0.5">Email</p>
              <p className="text-skin-text">{profile.email}</p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs mb-0.5">Specialization</p>
              <p className="text-skin-text">{profile.specialization}</p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs mb-0.5">Experience</p>
              <p className="text-skin-text">
                {profile.years_experience > 0 ? `${profile.years_experience} year${profile.years_experience > 1 ? "s" : ""}` : "—"}
              </p>
            </div>
            {profile.bio && (
              <div className="sm:col-span-2">
                <p className="text-skin-text-muted text-xs mb-0.5">Bio</p>
                <p className="text-skin-text leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {editOpen && profile && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}
