import { useState, useEffect } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import { formatDate } from "../../utils/formatters.js";

const statusConfig = {
  pending:   { label: "Pending",   cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  responded: { label: "Replied",   cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  closed:    { label: "Closed",    cls: "bg-skin-hover text-skin-text-muted border-skin-border" },
};

function StatusBadge({ status }) {
  const { label, cls } = statusConfig[status] ?? { label: status, cls: "" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function InquiryCard({ inquiry }) {
  const [expanded, setExpanded] = useState(inquiry.status === "responded");

  return (
    <div className={`bg-skin-card border rounded-2xl overflow-hidden transition-all ${
      inquiry.status === "responded" ? "border-emerald-500/30" : "border-skin-border"
    }`} style={{ boxShadow: "var(--shadow-sm)" }}>

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-skin-hover transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-9 h-9 rounded-full bg-skin-hover border border-skin-border flex items-center justify-center flex-shrink-0 text-skin-text-secondary font-bold text-sm">
          {inquiry.consultant_first_name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-skin-text font-medium text-sm">
            {inquiry.consultant_first_name} {inquiry.consultant_last_name}
          </p>
          <p className="text-skin-text-muted text-xs">{inquiry.consultant_specialization}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={inquiry.status} />
          <span className="text-skin-text-muted text-xs hidden sm:inline">{formatDate(inquiry.created_at)}</span>
          <svg
            className={`w-4 h-4 text-skin-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-skin-border space-y-4 pt-4">
          {inquiry.situation_tag && (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-skin-hover border border-skin-border text-skin-text-secondary">
              {inquiry.situation_tag}
            </span>
          )}

          {inquiry.brief_text && (
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Your brief</p>
              <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">{inquiry.brief_text}</p>
            </div>
          )}

          {inquiry.user_note && (
            <div>
              <p className="text-skin-text-muted text-xs uppercase tracking-wide mb-1.5">Your note</p>
              <p className="text-skin-text text-sm leading-relaxed">{inquiry.user_note}</p>
            </div>
          )}

          {inquiry.consultant_reply ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-500 text-xs font-semibold uppercase tracking-wide">
                  Reply from {inquiry.consultant_first_name}
                </p>
                {inquiry.replied_at && (
                  <p className="text-skin-text-muted text-xs">{formatDate(inquiry.replied_at)}</p>
                )}
              </div>
              <p className="text-skin-text text-sm leading-relaxed whitespace-pre-wrap">
                {inquiry.consultant_reply}
              </p>
            </div>
          ) : (
            inquiry.status === "pending" && (
              <p className="text-skin-text-muted text-sm italic">
                Waiting for the consultant to reply…
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    UserConsultantsBLL.getMyInquiries().then((res) => {
      if (res.success) setInquiries(res.inquiries);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-skin-text-muted text-sm">
        Loading…
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-skin-text-muted">
        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm font-medium">No inquiries yet</p>
        <p className="text-xs mt-1">Connect with a consultant to get started.</p>
      </div>
    );
  }

  const replied  = inquiries.filter((i) => i.status === "responded");
  const others   = inquiries.filter((i) => i.status !== "responded");
  const sorted   = [...replied, ...others];

  return (
    <div className="space-y-3">
      {replied.length > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-emerald-500 text-sm font-medium">
            {replied.length} {replied.length === 1 ? "inquiry has" : "inquiries have"} a new reply
          </p>
        </div>
      )}
      {sorted.map((inq) => (
        <InquiryCard key={inq.inquiry_id} inquiry={inq} />
      ))}
    </div>
  );
}
