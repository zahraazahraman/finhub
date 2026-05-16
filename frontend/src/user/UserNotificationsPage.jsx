import { useState, useEffect, useCallback } from "react";
import MyNotificationsBLL from "../bll/MyNotificationsBLL.js";
import { useUserNotifications } from "../context/UserNotificationContext.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
} from "../utils/constants.js";
import { formatDateTime } from "../utils/formatters.js";

const FILTERS = ["all", "bill", "goal", "insight", "consultant_inquiry", "system"];

const FILTER_LABELS = {
  all:                "All",
  bill:               "Bills",
  goal:               "Goals",
  insight:            "Insights",
  consultant_inquiry: "Consultants",
  system:             "System",
};

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState("all");
  const [deletingId, setDeletingId]       = useState(null);
  const { setUnreadCount }                = useUserNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    const result = await MyNotificationsBLL.getAll();
    if (result.success) setNotifications(result.notifications);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const unreadInFiltered = filtered.filter((n) => n.is_read === "0").length;

  const handleMarkRead = async (id) => {
    const result = await MyNotificationsBLL.markRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === id ? { ...n, is_read: "1" } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await MyNotificationsBLL.markAllRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const result = await MyNotificationsBLL.delete(id);
    if (result.success) {
      const removed = notifications.find((n) => n.notification_id === id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
      if (removed?.is_read === "0") setUnreadCount((c) => Math.max(0, c - 1));
    }
    setDeletingId(null);
  };

  return (
     <div className="animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-skin-text">Notifications</h1>
          <p className="text-skin-text-secondary text-sm mt-0.5">
            Stay on top of your bills, goals, and updates.
          </p>
        </div>
        {unreadInFiltered > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors duration-150 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = f === "all"
            ? notifications.filter((n) => n.is_read === "0").length
            : notifications.filter((n) => n.type === f && n.is_read === "0").length;

          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                border transition-all duration-150
                ${activeFilter === f
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover border-skin-border"
                }
              `}
            >
              {FILTER_LABELS[f]}
              {count > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-slate-900 rounded-full px-1.5 py-0.5 leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div className="bg-[var(--bg-card)] border border-skin-border rounded-2xl overflow-hidden"
           style={{ boxShadow: "var(--shadow-sm)" }}>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-skin-secondary flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-skin-text font-medium text-sm">No notifications</p>
            <p className="text-skin-text-muted text-xs mt-1">
              {activeFilter === "all"
                ? "You're all caught up!"
                : `No ${FILTER_LABELS[activeFilter].toLowerCase()} notifications yet.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-skin-border">
            {filtered.map((n) => (
              <li
                key={n.notification_id}
                className={`
                  flex items-start gap-4 px-5 py-4
                  transition-colors duration-150
                  ${n.is_read === "0" ? "bg-skin-secondary hover:bg-skin-hover" : "hover:bg-skin-hover opacity-70"}
                `}
              >
                {/* Unread dot */}
                <div className="mt-2 flex-shrink-0">
                  {n.is_read === "0"
                    ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    : <div className="w-2 h-2 rounded-full bg-skin-border" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-skin-text text-sm font-medium">{n.title}</p>
                  {n.message && (
                    <p className="text-skin-text-muted text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={NOTIFICATION_TYPES[n.type]} size="sm">
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </Badge>
                    <span className="text-skin-text-muted text-[10px]">{formatDateTime(n.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {n.is_read === "0" && (
                    <button
                      onClick={() => handleMarkRead(n.notification_id)}
                      className="p-1.5 rounded-lg text-skin-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-150"
                      title="Mark as read"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.notification_id)}
                    disabled={deletingId === n.notification_id}
                    className="p-1.5 rounded-lg text-skin-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 disabled:opacity-40"
                    title="Delete"
                  >
                    {deletingId === n.notification_id ? (
                      <Spinner size="xs" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}