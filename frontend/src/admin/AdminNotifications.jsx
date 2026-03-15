import { useState, useEffect } from "react";
import AdminNotificationsBLL from "../bll/AdminNotificationsBLL.js";

const typeStyles = {
  user_registered:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  user_suspended:    "bg-red-500/10 text-red-400 border-red-500/20",
  consultant_added:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  consultant_deleted:"bg-orange-500/10 text-orange-400 border-orange-500/20",
  category_added:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  category_deleted:  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  system:            "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const typeLabels = {
  user_registered:   "User Registered",
  user_suspended:    "User Suspended",
  consultant_added:  "Consultant Added",
  consultant_deleted:"Consultant Deleted",
  category_added:    "Category Added",
  category_deleted:  "Category Deleted",
  system:            "System",
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [filterRead, setFilterRead]       = useState("all");
  const [actionError, setActionError]     = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await AdminNotificationsBLL.getAll();
    if (result.success) setNotifications(result.notifications);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    const result = await AdminNotificationsBLL.markRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === id ? { ...n, is_read: "1" } : n)
      );
    } else setActionError(result.error);
  };

  const handleMarkAllRead = async () => {
    const result = await AdminNotificationsBLL.markAllRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
    } else setActionError(result.error);
  };

  const handleDelete = async (id) => {
    const result = await AdminNotificationsBLL.delete(id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
    } else setActionError(result.error);
  };

  const filtered = notifications.filter((n) => {
    const matchType = filterType === "all" || n.type === filterType;
    const matchRead =
      filterRead === "all" ||
      (filterRead === "unread" && n.is_read === "0") ||
      (filterRead === "read"   && n.is_read === "1");
    return matchType && matchRead;
  });

  const unreadCount = notifications.filter((n) => n.is_read === "0").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your admin notification center.
            {unreadCount > 0 && (
              <span className="ml-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as read
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        >
          <option value="all">All Types</option>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No notifications found.</div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.notification_id}
              className={`
                flex items-start gap-4 p-4 rounded-2xl border transition-all
                ${n.is_read === "0"
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-slate-900/30 border-slate-800/50 opacity-60"
                }
              `}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                {n.is_read === "0" ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeStyles[n.type]}`}>
                    {typeLabels[n.type]}
                  </span>
                  <span className="text-slate-600 text-xs">{formatDate(n.created_at)}</span>
                </div>
                <p className="text-white text-sm font-medium">{n.title}</p>
                {n.message && (
                  <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {n.is_read === "0" && (
                  <button
                    onClick={() => handleMarkRead(n.notification_id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    title="Mark as read"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.notification_id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && !error && (
        <p className="text-slate-600 text-xs mt-4">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  );
}