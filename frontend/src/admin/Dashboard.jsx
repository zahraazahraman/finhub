import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import DashboardBLL from "../bll/DashboardBLL.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const statusStyles = {
  active:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inactive:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
};

const notifTypeStyles = {
  user_registered:    "text-emerald-400",
  user_suspended:     "text-red-400",
  consultant_added:   "text-blue-400",
  consultant_deleted: "text-orange-400",
  category_added:     "text-purple-400",
  category_deleted:   "text-pink-400",
  system:             "text-slate-400",
};

const notifTypeLabels = {
  user_registered:    "User Registered",
  user_suspended:     "User Suspended",
  consultant_added:   "Consultant Added",
  consultant_deleted: "Consultant Deleted",
  category_added:     "Category Added",
  category_deleted:   "Category Deleted",
  system:             "System",
};

function StatCard({ label, value, sub, color = "emerald", icon }) {
  const colors = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    red:     "bg-red-500/10 border-red-500/20 text-red-400",
    blue:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
    yellow:  "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    purple:  "bg-purple-500/10 border-purple-500/20 text-purple-400",
    slate:   "bg-slate-500/10 border-slate-500/20 text-slate-400",
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

// CSV Export
const exportUsersCSV = (users) => {
  const headers = ["Name", "Email", "Status", "Joined"];
  const rows = users.map((u) => [
    `${u.first_name} ${u.last_name}`,
    u.email,
    u.status,
    formatDate(u.created_at),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "finhub_recent_users.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const exportDashboardPDF = (data, year) => {
  const doc = new jsPDF();
  const { stats, timeline, recent_users, recent_notifications } = data;
  const exportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  // Header
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

  // Stats section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Platform Overview", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Users",           stats.users.total],
      ["Active Users",          stats.users.active],
      ["Inactive Users",        stats.users.inactive],
      ["Suspended Users",       stats.users.suspended],
      ["Total Consultants",     stats.consultants],
      ["Total Categories",      stats.categories],
      ["Unread Notifications",  stats.unread_notifications],
    ],
    headStyles:  { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles:  { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Timeline section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`User Registrations — ${year}`, 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Month", "Registrations"]],
    body: timeline.map((t) => [t.month, t.users]),
    headStyles: { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles: { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Recent users section
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
      u.email,
      u.status,
      formatDate(u.created_at),
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles: { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Recent activity section
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
      n.title,
      n.message || "—",
      formatDate(n.created_at),
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: "bold" },
    bodyStyles: { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`FinHub Admin Report · Page ${i} of ${pageCount}`, 14, 290);
  }

  doc.save(`finhub_dashboard_${year}.pdf`);
};


export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [year, setYear]       = useState(new Date().getFullYear());
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");

  const fetchData = async (y, f, t) => {
    setLoading(true);
    const result = await DashboardBLL.getSummary(y, f || null, t || null);
    if (result.success) setData(result);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(year, from, to);
  }, [year]);

  const handleFilter = () => fetchData(year, from, to);

  const handleReset = () => {
    setFrom("");
    setTo("");
    fetchData(year, null, null);
  };


  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="w-6 h-6 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-400 text-sm">{error}</div>
  );

  const { stats, timeline, recent_users, recent_notifications, available_years } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening on FinHub.</p>
        </div>
        <button
          onClick={() => exportDashboardPDF(data, year)}
          className="flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-slate-400 text-sm">Date Range:</span>
        </div>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
        <span className="text-slate-600 text-sm">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
        <button
          onClick={handleFilter}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-1.5 rounded-xl transition-all"
        >
          Apply
        </button>
        {(from || to) && (
          <button
            onClick={handleReset}
            className="border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-sm px-4 py-1.5 rounded-xl transition-all"
          >
            Reset
          </button>
        )}
        {(from || to) && (
          <span className="text-emerald-400 text-xs ml-auto">
            Filtered: {from || "—"} → {to || "—"}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={stats.users.total}
          sub={`${stats.users.active} active · ${stats.users.suspended} suspended`}
          color="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Consultants"
          value={stats.consultants}
          sub="Listed on platform"
          color="blue"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M16 11l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={stats.categories}
          sub="Global categories"
          color="purple"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          }
        />
        <StatCard
          label="Unread Notifications"
          value={stats.unread_notifications}
          sub="Pending user alerts"
          color="yellow"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
        />
      </div>

      {/* User Status Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active",    value: stats.users.active,    color: "emerald" },
          { label: "Inactive",  value: stats.users.inactive,  color: "slate" },
          { label: "Suspended", value: stats.users.suspended, color: "red" },
        ].map((s) => (
          <StatCard key={s.label} label={`${s.label} Users`} value={s.value} color={s.color}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            }
          />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold">User Registrations</h2>
            <p className="text-slate-500 text-xs mt-0.5">Monthly signups over time</p>
          </div>
          {/* Year filter */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
          >
            {available_years.length > 0 ? (
              available_years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))
            ) : (
              <option value={year}>{year}</option>
            )}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
              labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
              itemStyle={{ color: "#10b981", fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorUsers)"
              dot={{ fill: "#10b981", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Users + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Users</h2>
            <button
              onClick={() => exportUsersCSV(recent_users)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
          <div className="space-y-3">
            {recent_users.map((u) => (
              <div key={u.user_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">
                    {u.first_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-slate-500 text-xs truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[u.status]}`}>
                    {u.status}
                  </span>
                  <span className="text-slate-600 text-[10px]">{formatDate(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Notifications */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recent_notifications.map((n) => (
              <div key={n.notification_id} className="flex items-start gap-3">
                <div className="mt-1.5 flex-shrink-0">
                  {n.is_read === "0"
                    ? <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    : <div className="w-2 h-2 rounded-full bg-slate-700" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{n.title}</p>
                  {n.message && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{n.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium ${notifTypeStyles[n.type]}`}>
                      {notifTypeLabels[n.type]}
                    </span>
                    <span className="text-slate-700 text-[10px]">·</span>
                    <span className="text-slate-600 text-[10px]">{formatDate(n.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}