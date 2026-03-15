import { useState, useEffect } from "react";
import UserNotificationsBLL from "../bll/UserNotificationsBLL.js";

const typeStyles = {
  bill:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  goal:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  insight: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  system:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const typeLabels = {
  bill:    "Bill",
  goal:    "Goal",
  insight: "Insight",
  system:  "System",
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-semibold mb-2">Are you sure?</h3>
        <p className="text-slate-400 text-sm mb-6">This will permanently delete this notification.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [filterRead, setFilterRead]       = useState("all");
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [actionError, setActionError]     = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await UserNotificationsBLL.getAll();
    if (result.success) setNotifications(result.notifications);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await UserNotificationsBLL.delete(deleteTarget);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.notification_id !== deleteTarget));
    } else {
      setActionError(result.error);
    }
    setDeleteTarget(null);
  };

  const filtered = notifications.filter((n) => {
    const matchSearch =
      `${n.title} ${n.message} ${n.first_name} ${n.last_name} ${n.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchType = filterType === "all" || n.type === filterType;
    const matchRead =
      filterRead === "all" ||
      (filterRead === "unread" && n.is_read === "0") ||
      (filterRead === "read"   && n.is_read === "1");
    return matchSearch && matchType && matchRead;
  });

  const unreadCount = notifications.filter((n) => n.is_read === "0").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor all notifications sent to users.
          {unreadCount > 0 && (
            <span className="ml-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, message or user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
          />
        </div>
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

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Notification</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((n) => (
                <tr key={n.notification_id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Notification */}
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{n.message}</p>
                    )}
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-xs font-bold">
                          {n.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{n.first_name} {n.last_name}</p>
                        <p className="text-slate-500 text-xs">{n.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeStyles[n.type]}`}>
                      {typeLabels[n.type]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {n.is_read === "1" ? (
                      <span className="text-slate-500 text-xs">Read</span>
                    ) : (
                      <span className="text-emerald-400 text-xs font-medium">Unread</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(n.created_at)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteTarget(n.notification_id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-slate-600 text-xs mt-4">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}

      {deleteTarget && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
