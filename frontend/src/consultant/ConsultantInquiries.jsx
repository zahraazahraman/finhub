import { useState, useEffect } from "react";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatters.js";

const STATUS_TABS = ["All", "Pending", "Responded", "Closed"];

const statusColors = {
  pending:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  responded: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  closed:    "bg-skin-hover text-skin-text-muted border-skin-border",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] ?? ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InquiryCard({ inquiry, onReply, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-skin-card border border-skin-border rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-skin-hover transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-500 font-bold text-sm">
          {inquiry.user_first_name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-skin-text font-medium text-sm">
            {inquiry.user_first_name} {inquiry.user_last_name}
          </p>
          <p className="text-skin-text-muted text-xs truncate">{inquiry.user_email}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {inquiry.situation_tag && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-skin-hover text-skin-text-secondary border border-skin-border hidden sm:inline">
              {inquiry.situation_tag}
            </span>
          )}
          <StatusBadge status={inquiry.status} />
          <span className="text-skin-text-muted text-xs hidden md:inline">{formatDate(inquiry.created_at)}</span>
          <svg
            className={`w-4 h-4 text-skin-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-skin-border space-y-4 pt-4">
          {inquiry.brief_text && (
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Brief</p>
              <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">{inquiry.brief_text}</p>
            </div>
          )}
          {inquiry.user_note && (
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">User note</p>
              <p className="text-skin-text text-sm leading-relaxed">{inquiry.user_note}</p>
            </div>
          )}

          {inquiry.consultant_reply && (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
              <p className="text-emerald-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Your reply</p>
              <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">{inquiry.consultant_reply}</p>
              {inquiry.replied_at && (
                <p className="text-skin-text-muted text-xs mt-2">{formatDate(inquiry.replied_at)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {inquiry.status === "pending" && (
              <button
                onClick={() => onReply(inquiry)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-all"
              >
                Reply
              </button>
            )}
            {inquiry.status === "responded" && (
              <button
                onClick={() => onClose(inquiry)}
                className="px-4 py-2 border border-skin-border text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover rounded-xl text-sm font-medium transition-all"
              >
                Mark as Closed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyModal({ inquiry, onClose, onDone }) {
  const [text, setText]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) { setError("Reply cannot be empty."); return; }
    setError("");
    setLoading(true);
    const { ok, data } = await api.patch(`/consultant-inquiries/${inquiry.inquiry_id}/reply`, { reply_text: text });
    setLoading(false);
    if (ok && data.success) { onDone(); }
    else { setError(data?.message || "Failed to send reply."); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-skin-card border border-skin-border rounded-2xl p-6 w-full max-w-lg animate-scale-in" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-skin-text font-semibold">Reply to {inquiry.user_first_name}</h2>
          <button onClick={onClose} className="text-skin-text-muted hover:text-skin-text transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {inquiry.brief_text && (
          <div className="bg-skin-hover rounded-xl p-3 mb-4 text-sm text-skin-text-secondary leading-relaxed line-clamp-3">
            {inquiry.brief_text}
          </div>
        )}

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply here…"
          className="w-full bg-skin-input border border-skin-border rounded-xl px-4 py-3 text-skin-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 placeholder:text-skin-text-muted"
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex gap-3 mt-4">
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
            {loading ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsultantInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [replyTarget, setReplyTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const { ok, data } = await api.get("/consultant-inquiries");
    if (ok && data.success) setInquiries(data.inquiries);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleClose = async (inquiry) => {
    const { ok, data } = await api.patch(`/consultant-inquiries/${inquiry.inquiry_id}/close`, {});
    if (ok && data.success) load();
  };

  const filtered = inquiries.filter((i) =>
    activeTab === "All" || i.status === activeTab.toLowerCase()
  );

  const counts = {
    All:       inquiries.length,
    Pending:   inquiries.filter((i) => i.status === "pending").length,
    Responded: inquiries.filter((i) => i.status === "responded").length,
    Closed:    inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-skin-text font-bold text-xl">Inquiries</h1>
        <p className="text-skin-text-secondary text-sm mt-0.5">
          Messages from users seeking your guidance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-skin-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-all
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-skin-text-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-skin-text-muted">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">No {activeTab.toLowerCase()} inquiries.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <InquiryCard
              key={inq.inquiry_id}
              inquiry={inq}
              onReply={setReplyTarget}
              onClose={handleClose}
            />
          ))}
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          inquiry={replyTarget}
          onClose={() => setReplyTarget(null)}
          onDone={() => { setReplyTarget(null); load(); }}
        />
      )}
    </div>
  );
}
