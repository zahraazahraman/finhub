import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import AdminNotificationsBLL from "../../bll/AdminNotificationsBLL.js";
import { useNotifications } from "../../context/NotificationContext.jsx";
import Badge from "./../../components/ui/Badge.jsx";
import Spinner from "./../../components/ui/Spinner.jsx";
import {
  ADMIN_NOTIFICATION_TYPES,
  ADMIN_NOTIFICATION_TYPE_LABELS,
} from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatters.js";

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [position, setPosition]           = useState({ top: 0, left: 0 });
  const buttonRef                         = useRef(null);
  const { unreadCount, setUnreadCount, refreshCount } = useNotifications();

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px below the button
        left: rect.right - 320, // 320px wide, aligned to right
      });
    }
  }, [open]);

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
    <>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover transition-all duration-150"
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
      {open && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/20 z-[999]" onClick={() => setOpen(false)} />,
        document.body
      )}
      {open && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
          }}
          className="w-80 bg-[var(--bg-card)] border border-skin-border rounded-2xl overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-skin-border">
            <h3 className="text-skin-text font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors duration-150"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-skin-text-muted text-sm">
                No notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notification_id}
                  className={`
                    flex items-start gap-3 px-4 py-3 border-b border-skin-border
                    hover:bg-skin-hover transition-colors duration-150
                    ${n.is_read === "0" ? "bg-skin-secondary" : "opacity-60"}
                  `}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    {n.is_read === "0"
                      ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      : <div className="w-2 h-2 rounded-full bg-skin-border" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-skin-text text-xs font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-skin-text-muted text-xs mt-0.5 truncate">{n.message}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={ADMIN_NOTIFICATION_TYPES[n.type]} size="sm">
                        {ADMIN_NOTIFICATION_TYPE_LABELS[n.type]}
                      </Badge>
                      <span className="text-skin-text-muted text-[10px]">{formatDateTime(n.created_at)}</span>
                    </div>
                  </div>
                  {n.is_read === "0" && (
                    <button
                      onClick={() => handleMarkRead(n.notification_id)}
                      className="p-1 rounded-lg text-skin-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-150 flex-shrink-0"
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
          <div className="px-4 py-3 border-t border-skin-border">
            <a
              href="/admin/notifications"
              className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors duration-150"
            >
              View all notifications →
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}