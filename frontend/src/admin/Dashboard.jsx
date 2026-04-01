import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardBLL from "../bll/DashboardBLL.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Select from "../components/ui/Select.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { USER_STATUS_STYLES } from "../utils/constants.js";
import { formatDate, formatDateTime, getInitials } from "../utils/formatters.js";

function StatCard({ label, value, sub, color = "emerald", icon }) {
  const colors = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    red:     "bg-red-500/10 border-red-500/20 text-red-500",
    blue:    "bg-blue-500/10 border-blue-500/20 text-blue-500",
    yellow:  "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    purple:  "bg-purple-500/10 border-purple-500/20 text-purple-500",
    slate:   "bg-skin-hover border-skin-border text-skin-text-secondary",
  };

  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-3">
        <p className="text-skin-text-secondary text-sm">{label}</p>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-skin-text">{value}</p>
      {sub && <p className="text-skin-text-muted text-xs mt-1">{sub}</p>}
    </Card>
  );
}

const exportDashboardPDF = (data, year) => {
  const doc = new jsPDF();
  const { stats, timeline, recent_users, recent_notifications } = data;
  const exportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FinHub", 14, 18);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Admin Dashboard Report", 14, 26);
  doc.text(`Generated: ${exportDate}`, 14, 33);

  let y = 50;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Platform Overview", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Users",          stats.users.total],
      ["Active Users",         stats.users.active],
      ["Inactive Users",       stats.users.inactive],
      ["Suspended Users",      stats.users.suspended],
      ["Total Consultants",    stats.consultants],
      ["Total Categories",     stats.categories],
      ["Unread Notifications", stats.unread_notifications],
    ],
    headStyles:         { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles:         { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin:             { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`User Registrations — ${year}`, 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Month", "Registrations"]],
    body: timeline.map((t) => [t.month, t.users]),
    headStyles:         { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles:         { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin:             { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Recent Users", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Name", "Email", "Status", "Joined"]],
    body: recent_users.map((u) => [
      `${u.first_name} ${u.last_name}`,
      u.email, u.status,
      formatDate(u.created_at),
    ]),
    headStyles:         { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles:         { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin:             { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;
  if (y > 240) doc.addPage();

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Recent Activity", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Title", "Message", "Date"]],
    body: recent_notifications.map((n) => [
      n.title, n.message || "—",
      formatDate(n.created_at),
    ]),
    headStyles:         { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles:         { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin:             { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`FinHub Admin Report · Page ${i} of ${pageCount}`, 14, 290);
  }

  doc.save(`finhub_dashboard_${year}.pdf`);
};

const exportUsersCSV = (users) => {
  const headers = ["Name", "Email", "Status", "Joined"];
  const rows    = users.map((u) => [
    `${u.first_name} ${u.last_name}`,
    u.email, u.status,
    formatDate(u.created_at),
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "finhub_recent_users.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const ADMIN_NOTIF_TYPE_STYLES = {
  user_registered:    "success",
  user_suspended:     "danger",
  consultant_added:   "info",
  consultant_deleted: "orange",
  category_added:     "purple",
  category_deleted:   "pink",
  system:             "default",
};

const ADMIN_NOTIF_TYPE_LABELS = {
  user_registered:    "User Registered",
  user_suspended:     "User Suspended",
  consultant_added:   "Consultant Added",
  consultant_deleted: "Consultant Deleted",
  category_added:     "Category Added",
  category_deleted:   "Category Deleted",
  system:             "System",
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [year, setYear]       = useState(new Date().getFullYear());
  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");

  const fetchData = async (y, f, t) => {
    setLoading(true);
    const result = await DashboardBLL.getSummary(y, f || null, t || null);
    if (result.success) setData(result);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => { fetchData(year, from, to); }, [year]);

  const handleFilter = () => fetchData(year, from, to);
  const handleReset  = () => {
    setFrom(""); setTo("");
    fetchData(year, null, null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-500 text-sm">{error}</div>
  );

  const { stats, timeline, recent_users, recent_notifications, available_years } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-skin-text">Dashboard</h1>
          <p className="text-skin-text-secondary text-sm mt-1">Welcome back! Here's what's happening on FinHub.</p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => exportDashboardPDF(data, year)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        >
          Export PDF
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card padding="md" className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-skin-text-secondary text-sm">Date Range:</span>
        </div>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-skin-input border border-skin-border rounded-xl px-3 py-1.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
        <span className="text-skin-text-muted text-sm">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-skin-input border border-skin-border rounded-xl px-3 py-1.5 text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
        <Button variant="primary" size="sm" onClick={handleFilter}>Apply</Button>
        {(from || to) && (
          <Button variant="secondary" size="sm" onClick={handleReset}>Reset</Button>
        )}
        {(from || to) && (
          <span className="text-emerald-500 text-xs ml-auto">
            Filtered: {from || "—"} → {to || "—"}
          </span>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users" value={stats.users.total}
          sub={`${stats.users.active} active · ${stats.users.suspended} suspended`}
          color="emerald"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Consultants" value={stats.consultants}
          sub="Listed on platform" color="blue"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>}
        />
        <StatCard
          label="Categories" value={stats.categories}
          sub="Global categories" color="purple"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7"/></svg>}
        />
        <StatCard
          label="Unread Notifications" value={stats.unread_notifications}
          sub="Pending user alerts" color="yellow"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
        />
      </div>

      {/* User Status Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Users",    value: stats.users.active,    color: "emerald" },
          { label: "Inactive Users",  value: stats.users.inactive,  color: "slate" },
          { label: "Suspended Users", value: stats.users.suspended, color: "red" },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} color={s.color}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
          />
        ))}
      </div>

      {/* Chart */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-skin-text font-semibold">User Registrations</h2>
            <p className="text-skin-text-muted text-xs mt-0.5">Monthly signups over time</p>
          </div>
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            options={available_years.length > 0
              ? available_years.map((y) => ({ value: y, label: y }))
              : [{ value: year, label: year }]
            }
            className="w-28"
          />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "var(--text-primary)", fontSize: 12 }}
              itemStyle={{ color: "#10b981", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fill="url(#colorUsers)" dot={{ fill: "#10b981", r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Users + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-skin-text font-semibold">Recent Users</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportUsersCSV(recent_users)}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Export CSV
            </Button>
          </div>
          <div className="space-y-3">
            {recent_users.map((u) => (
              <div key={u.user_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-500 text-xs font-bold">{getInitials(u.first_name, u.last_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-skin-text text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-skin-text-muted text-xs truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={USER_STATUS_STYLES[u.status]}>{u.status}</Badge>
                  <span className="text-skin-text-muted text-[10px]">{formatDate(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding="md">
          <h2 className="text-skin-text font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recent_notifications.map((n) => (
              <div key={n.notification_id} className="flex items-start gap-3">
                <div className="mt-1.5 flex-shrink-0">
                  {n.is_read === "0"
                    ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    : <div className="w-2 h-2 rounded-full bg-skin-border" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-skin-text text-sm font-medium">{n.title}</p>
                  {n.message && (
                    <p className="text-skin-text-muted text-xs mt-0.5 truncate">{n.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={ADMIN_NOTIF_TYPE_STYLES[n.type]} size="sm">
                      {ADMIN_NOTIF_TYPE_LABELS[n.type]}
                    </Badge>
                    <span className="text-skin-text-muted text-[10px]">{formatDateTime(n.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}