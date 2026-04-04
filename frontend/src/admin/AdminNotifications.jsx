import { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext.jsx";
import AdminNotificationsBLL from "../bll/AdminNotificationsBLL.js";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Select from "../components/ui/Select.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  ADMIN_NOTIFICATION_TYPES,
  ADMIN_NOTIFICATION_TYPE_LABELS,
} from "../utils/constants.js";
import { formatDateTime } from "../utils/formatters.js";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [filterRead, setFilterRead]       = useState("all");
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [actionError, setActionError]     = useState("");
  const { refreshCount } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await AdminNotificationsBLL.getAll();
    if (result.success) setNotifications(result.notifications);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    const result = await AdminNotificationsBLL.markRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === id ? { ...n, is_read: "1" } : n)
      );
      refreshCount();
    } else setActionError(result.error);
  };

  const handleMarkAllRead = async () => {
    const result = await AdminNotificationsBLL.markAllRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
      refreshCount();
    } else setActionError(result.error);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await AdminNotificationsBLL.delete(deleteTarget);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.notification_id !== deleteTarget));
    } else setActionError(result.error);
    setDeleteTarget(null);
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
          <h1 className="text-2xl font-bold text-skin-text">Notifications</h1>
          <p className="text-skin-text-secondary text-sm mt-1 flex items-center gap-2">
            Your admin notification center.
            {unreadCount > 0 && (
              <Badge variant="success">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="md"
            onClick={handleMarkAllRead}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
            iconPosition="left"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: "all", label: "All Types" },
            ...Object.entries(ADMIN_NOTIFICATION_TYPE_LABELS).map(([val, label]) => ({
              value: val, label,
            })),
          ]}
        />
        <Select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          options={[
            { value: "all",    label: "All" },
            { value: "unread", label: "Unread" },
            { value: "read",   label: "Read" },
          ]}
        />
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-skin-text-muted text-sm">No notifications found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.notification_id}
              className={`
                flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150
                ${n.is_read === "0"
                  ? "bg-skin-card border-skin-border"
                  : "bg-skin-secondary border-skin-border opacity-60"
                }
              `}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                {n.is_read === "0"
                  ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  : <div className="w-2 h-2 rounded-full bg-skin-border" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={ADMIN_NOTIFICATION_TYPES[n.type]}>
                    {ADMIN_NOTIFICATION_TYPE_LABELS[n.type]}
                  </Badge>
                  <span className="text-skin-text-muted text-xs">{formatDateTime(n.created_at)}</span>
                </div>
                <p className="text-skin-text text-sm font-medium">{n.title}</p>
                {n.message && (
                  <p className="text-skin-text-secondary text-xs mt-0.5">{n.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {n.is_read === "0" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-skin-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"
                    onClick={() => handleMarkRead(n.notification_id)}
                    title="Mark as read"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    }
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-skin-text-muted hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => setDeleteTarget(n.notification_id)}
                  title="Delete"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <p className="text-skin-text-muted text-xs mt-4">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}

      {deleteTarget && (
        <Modal
          title="Are you sure?"
          description="This will permanently delete this notification."
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}