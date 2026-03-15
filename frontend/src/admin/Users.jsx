import { useState, useEffect } from "react";
import UsersBLL from "../bll/UsersBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";

const statusStyles = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusOptions = ["active", "inactive", "suspended"];

function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-semibold mb-2">Are you sure?</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const exportUsersCSV = (users) => {
  const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Status", "Verified", "Joined"];
  const rows = users.map((u) => [
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number || "—",
    u.status,
    u.email_verified === "1" ? "Yes" : "No",
    new Date(u.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    }),
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "finhub_users.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
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
    } else {
      setActionError(result.error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await UsersBLL.delete(deleteTarget);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget));
      refreshCount();
    } else {
      setActionError(result.error);
    }
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all registered users on FinHub.</p>
        </div>
        <button
          onClick={() => exportUsersCSV(filtered)}
          className="flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* Verified filter */}
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not Verified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg
              className="w-6 h-6 animate-spin text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No users found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Phone
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Verified
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Joined
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((user) => (
                <tr
                  key={user.user_id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-xs font-bold">
                          {user.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {user.phone_number || "—"}
                  </td>

                  {/* Verified */}
                  <td className="px-6 py-4">
                    {user.email_verified === "1" ? (
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
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
                      <span className="text-slate-500 text-xs">
                        Not verified
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Status dropdown */}
                      <select
                        value={user.status}
                        onChange={(e) =>
                          handleStatusChange(user.user_id, e.target.value)
                        }
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(user.user_id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
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
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!loading && !error && (
        <p className="text-slate-600 text-xs mt-4">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* Confirm delete modal */}
      {deleteTarget && (
        <ConfirmModal
          message="This will permanently delete the user and cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
