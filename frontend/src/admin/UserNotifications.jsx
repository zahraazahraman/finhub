import { useState, useEffect } from "react";
import UserNotificationsBLL from "../bll/UserNotificationsBLL.js";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Table from "../components/ui/Table.jsx";
import Select from "../components/ui/Select.jsx";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
} from "../utils/constants.js";
import { formatDateTime, getInitials } from "../utils/formatters.js";

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

  useEffect(() => { fetchNotifications(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await UserNotificationsBLL.delete(deleteTarget);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.notification_id !== deleteTarget));
    } else setActionError(result.error);
    setDeleteTarget(null);
  };

  const filtered = notifications.filter((n) => {
    const matchSearch =
      `${n.title} ${n.message} ${n.first_name} ${n.last_name} ${n.email}`
        .toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || n.type === filterType;
    const matchRead =
      filterRead === "all" ||
      (filterRead === "unread" && n.is_read === "0") ||
      (filterRead === "read"   && n.is_read === "1");
    return matchSearch && matchType && matchRead;
  });

  const unreadCount = notifications.filter((n) => n.is_read === "0").length;

  const searchIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );

  const columns = [
    {
      key: "notification",
      label: "Notification",
      render: (n) => (
        <div>
          <p className="text-skin-text text-sm font-medium">{n.title}</p>
          {n.message && (
            <p className="text-skin-text-muted text-xs mt-0.5 max-w-xs truncate">{n.message}</p>
          )}
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (n) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-500 text-xs font-bold">
              {getInitials(n.first_name, n.last_name)}
            </span>
          </div>
          <div>
            <p className="text-skin-text text-xs font-medium">{n.first_name} {n.last_name}</p>
            <p className="text-skin-text-muted text-xs">{n.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (n) => (
        <Badge variant={NOTIFICATION_TYPES[n.type]}>
          {NOTIFICATION_TYPE_LABELS[n.type]}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (n) => n.is_read === "1" ? (
        <span className="text-skin-text-muted text-xs">Read</span>
      ) : (
        <span className="text-emerald-500 text-xs font-medium">Unread</span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (n) => (
        <span className="text-skin-text-secondary text-xs">{formatDateTime(n.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (n) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-skin-text-muted hover:text-red-500 hover:bg-red-500/10"
          onClick={() => setDeleteTarget(n.notification_id)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          }
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-skin-text">User Notifications</h1>
        <p className="text-skin-text-secondary text-sm mt-1 flex items-center gap-2">
          Monitor all notifications sent to users.
          {unreadCount > 0 && (
            <Badge variant="success">{unreadCount} unread</Badge>
          )}
        </p>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by title, message or user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={searchIcon}
          className="flex-1 mb-0"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: "all", label: "All Types" },
            ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([val, label]) => ({
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

      {error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No notifications found."
        />
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