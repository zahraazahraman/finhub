import { useState, useEffect } from "react";
import ConsultantApplicationsBLL from "../bll/ConsultantApplicationsBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { formatDate } from "../utils/formatters.js";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusBadge = (status) => {
  if (status === "pending")  return <Badge variant="warning">Pending</Badge>;
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  return <Badge variant="danger">Rejected</Badge>;
};

function ReviewModal({ application, onClose, onDone }) {
  const [action, setAction]   = useState(null); // "approve" | "reject"
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { refreshCount }      = useNotifications();

  const app = application;

  const handleDecision = async () => {
    setError("");
    setLoading(true);
    const result = action === "approve"
      ? await ConsultantApplicationsBLL.approve(app.application_id, note || null)
      : await ConsultantApplicationsBLL.reject(app.application_id, note || null);
    setLoading(false);
    if (!result.success) { setError(result.message); return; }
    refreshCount();
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div
        className="bg-skin-card border border-skin-border rounded-2xl w-full max-w-2xl animate-scale-in"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-skin-border">
          <div>
            <h2 className="text-skin-text font-semibold">
              {app.first_name} {app.last_name}
            </h2>
            <p className="text-skin-text-muted text-xs mt-0.5">{app.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge(app.status)}
            <button
              onClick={onClose}
              className="text-skin-text-muted hover:text-skin-text transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Specialization</p>
              <p className="text-skin-text font-medium">{app.specialization}</p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Experience</p>
              <p className="text-skin-text font-medium">
                {app.years_experience > 0 ? `${app.years_experience} yr${app.years_experience > 1 ? "s" : ""}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Phone</p>
              <p className="text-skin-text">{app.phone || "—"}</p>
            </div>
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Applied</p>
              <p className="text-skin-text">{formatDate(app.created_at)}</p>
            </div>
            {app.linkedin_url && (
              <div className="col-span-2">
                <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">LinkedIn / Website</p>
                <a
                  href={app.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:underline text-sm truncate block"
                >
                  {app.linkedin_url}
                </a>
              </div>
            )}
          </div>

          <div>
            <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Bio</p>
            <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">{app.bio}</p>
          </div>
          <div>
            <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Motivation</p>
            <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">{app.motivation}</p>
          </div>

          {app.status !== "pending" && app.admin_note && (
            <div className="bg-skin-hover rounded-xl p-4">
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1">Reviewer note</p>
              <p className="text-skin-text text-sm">{app.admin_note}</p>
            </div>
          )}

          {/* Decision form — only for pending */}
          {app.status === "pending" && (
            <div className="border-t border-skin-border pt-5 space-y-4">
              <p className="text-skin-text text-sm font-medium">Make a decision</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setAction("approve")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${action === "approve"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-skin-border text-skin-text-secondary hover:border-emerald-500/40 hover:text-emerald-500"
                    }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => setAction("reject")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${action === "reject"
                      ? "bg-red-500 border-red-500 text-white"
                      : "border-skin-border text-skin-text-secondary hover:border-red-500/40 hover:text-red-500"
                    }`}
                >
                  Reject
                </button>
              </div>

              {action && (
                <div>
                  <label className="text-skin-text-muted text-xs uppercase tracking-wide block mb-1.5">
                    Note to applicant {action === "approve" ? "(optional)" : "(recommended)"}
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      action === "approve"
                        ? "Welcome message or instructions…"
                        : "Briefly explain the reason for rejection…"
                    }
                    className="w-full bg-skin-input border border-skin-border rounded-xl px-4 py-3 text-skin-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 placeholder:text-skin-text-muted"
                  />
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {action && (
                <button
                  onClick={handleDecision}
                  disabled={loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all
                    ${action === "approve" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400"}
                    disabled:opacity-60`}
                >
                  {loading
                    ? "Processing…"
                    : action === "approve"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConsultantApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("All");
  const [selected, setSelected]         = useState(null);
  const [search, setSearch]             = useState("");

  const load = async () => {
    setLoading(true);
    const result = await ConsultantApplicationsBLL.getAll();
    if (result.success) setApplications(result.applications);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = applications.filter((a) => {
    const matchTab =
      activeTab === "All" ||
      a.status === activeTab.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.specialization.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    All:      applications.length,
    Pending:  applications.filter((a) => a.status === "pending").length,
    Approved: applications.filter((a) => a.status === "approved").length,
    Rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-skin-text font-bold text-xl">Consultant Applications</h1>
          <p className="text-skin-text-secondary text-sm mt-0.5">
            Review and manage incoming applications to join the consultant network.
          </p>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="bg-skin-card border border-skin-border rounded-2xl overflow-hidden"
           style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-skin-border gap-4 flex-wrap">
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all
                  ${activeTab === tab
                    ? "border-emerald-500 text-emerald-500"
                    : "border-transparent text-skin-text-secondary hover:text-skin-text"
                  }`}
              >
                {tab}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                  ${activeTab === tab ? "bg-emerald-500/10 text-emerald-500" : "bg-skin-hover text-skin-text-muted"}`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email…"
              className="pl-9 pr-4 py-1.5 bg-skin-input border border-skin-border rounded-lg text-sm text-skin-text placeholder:text-skin-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 w-56"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-skin-text-muted text-sm">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-skin-text-muted">
            <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 12h6m-3-3v6m-7 4h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
            </svg>
            <p className="text-sm">No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-skin-border">
                  <th className="px-5 py-3 text-skin-text-muted font-medium text-xs uppercase tracking-wide">Applicant</th>
                  <th className="px-5 py-3 text-skin-text-muted font-medium text-xs uppercase tracking-wide">Specialization</th>
                  <th className="px-5 py-3 text-skin-text-muted font-medium text-xs uppercase tracking-wide hidden md:table-cell">Experience</th>
                  <th className="px-5 py-3 text-skin-text-muted font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Applied</th>
                  <th className="px-5 py-3 text-skin-text-muted font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-skin-border">
                {filtered.map((app) => (
                  <tr key={app.application_id} className="hover:bg-skin-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-skin-text font-medium">{app.first_name} {app.last_name}</p>
                      <p className="text-skin-text-muted text-xs">{app.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-skin-text">{app.specialization}</td>
                    <td className="px-5 py-3.5 text-skin-text-secondary hidden md:table-cell">
                      {app.years_experience > 0 ? `${app.years_experience} yr${app.years_experience > 1 ? "s" : ""}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-skin-text-secondary hidden lg:table-cell">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(app.status)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelected(app)}
                        className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ReviewModal
          application={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
