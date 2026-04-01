import { useState, useEffect } from "react";
import UsersBLL from "../bll/UsersBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Select from "../components/ui/Select.jsx";
import Table from "../components/ui/Table.jsx";
import { USER_STATUSES, USER_STATUS_STYLES } from "../utils/constants.js";
import { formatDate } from "../utils/formatters.js";
import { getInitials } from "../utils/formatters.js";

const exportUsersCSV = (users) => {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Status",
    "Verified",
    "Joined",
  ];
  const rows = users.map((u) => [
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number || "—",
    u.status,
    u.email_verified === "1" ? "Yes" : "No",
    formatDate(u.created_at),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finhub_users.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState("");
  const { refreshCount } = useNotifications();

  const fetchUsers = async () => {
    setLoading(true);
    const result = await UsersBLL.getAll();
    if (result.success) setUsers(result.users);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    setActionError("");
    const result = await UsersBLL.updateStatus(userId, newStatus);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, status: newStatus } : u,
        ),
      );
      refreshCount();
    } else setActionError(result.error);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await UsersBLL.delete(deleteTarget);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget));
      refreshCount();
    } else setActionError(result.error);
    setDeleteTarget(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch = `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && u.email_verified === "1") ||
      (filterVerified === "unverified" && u.email_verified !== "1");
    return matchSearch && matchStatus && matchVerified;
  });

  const searchIcon = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );

  const columns = [
    {
      key: "user",
      label: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-500 text-xs font-bold">
              {getInitials(u.first_name, u.last_name)}
            </span>
          </div>
          <div>
            <p className="text-skin-text text-sm font-medium">
              {u.first_name} {u.last_name}
            </p>
            <p className="text-skin-text-muted text-xs">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone_number",
      label: "Phone",
      render: (u) => (
        <span className="text-skin-text-secondary text-sm">
          {u.phone_number || "—"}
        </span>
      ),
    },
    {
      key: "email_verified",
      label: "Verified",
      render: (u) =>
        u.email_verified === "1" ? (
          <span className="text-emerald-500 text-xs flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
        ) : (
          <span className="text-skin-text-muted text-xs">Not verified</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <Badge variant={USER_STATUS_STYLES[u.status]}>{u.status}</Badge>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (u) => (
        <span className="text-skin-text-secondary text-sm">
          {formatDate(u.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex items-center gap-2">
          <select
            value={u.status}
            onChange={(e) => handleStatusChange(u.user_id, e.target.value)}
            className="bg-skin-input border border-skin-border rounded-lg px-2 py-1.5 text-skin-text text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
          >
            {USER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            className="text-skin-text-muted hover:text-red-500 hover:bg-red-500/10"
            onClick={() => setDeleteTarget(u.user_id)}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-skin-text">Users</h1>
          <p className="text-skin-text-secondary text-sm mt-1">
            Manage all registered users on FinHub.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => exportUsersCSV(filtered)}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        >
          Export CSV
        </Button>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={searchIcon}
          className="flex-1 mb-0"
        />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: "all", label: "All Statuses" },
            ...USER_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
          ]}
        />
        <Select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          options={[
            { value: "all",        label: "All Users" },
            { value: "verified",   label: "Verified" },
            { value: "unverified", label: "Not Verified" },
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
          emptyMessage="No users found."
        />
      )}

      {!loading && !error && (
        <p className="text-skin-text-muted text-xs mt-4">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {deleteTarget && (
        <Modal
          title="Are you sure?"
          description="This will permanently delete the user and cannot be undone."
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
