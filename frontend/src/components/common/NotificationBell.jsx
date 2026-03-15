import { useState, useEffect, useRef } from "react";
import AdminNotificationsBLL from "../../bll/AdminNotificationsBLL.js";
import { useNotifications } from "../../context/NotificationContext.jsx";

const typeLabels = {
  user_registered:    "User Registered",
  user_suspended:     "User Suspended",
  consultant_added:   "Consultant Added",
  consultant_deleted: "Consultant Deleted",
  category_added:     "Category Added",
  category_deleted:   "Category Deleted",
  system:             "System",
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const dropdownRef                       = useRef(null);
  const { unreadCount, setUnreadCount, refreshCount } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecent = async () => {
    setLoading(true);
    const result = await AdminNotificationsBLL.getRecent();
    if (result.success) setNotifications(result.notifications);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) fetchRecent();
  };

  const handleMarkRead = async (id) => {
    const result = await AdminNotificationsBLL.markRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === id ? { ...n, is_read: "1" } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await AdminNotificationsBLL.markAllRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-bold text-slate-900 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="w-5 h-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No notifications.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notification_id}
                  className={`
                    flex items-start gap-3 px-4 py-3 border-b border-slate-800/50
                    hover:bg-slate-800/40 transition-colors
                    ${n.is_read === "0" ? "bg-slate-800/20" : "opacity-60"}
                  `}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    {n.is_read === "0"
                      ? <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      : <div className="w-2 h-2 rounded-full bg-slate-700" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{n.message}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600 text-[10px]">{typeLabels[n.type]}</span>
                      <span className="text-slate-700 text-[10px]">·</span>
                      <span className="text-slate-600 text-[10px]">{formatDate(n.created_at)}</span>
                    </div>
                  </div>
                  {n.is_read === "0" && (
                    <button
                      onClick={() => handleMarkRead(n.notification_id)}
                      className="p-1 rounded-lg text-slate-600 hover:text-emerald-400 transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-800">
            <a
              href="/admin/notifications"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}