import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "../common/NotificationBell.jsx";

const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: "/admin/user-notifications",
    label: "User Notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <circle cx="18" cy="5" r="3" fill="currentColor" stroke="none" className="text-emerald-400" />
      </svg>
    ),
  },
  {
    path: "/admin/consultants",
    label: "Consultants",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: "/admin/categories",
    label: "Categories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── Sidebar ── */}
      <aside
        className={`
          flex flex-col bg-slate-900 border-r border-slate-800
          transition-all duration-300 ease-in-out flex-shrink-0
          ${collapsed ? "w-16" : "w-60"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500 rounded-lg rotate-6 opacity-30" />
            <div className="absolute inset-0 bg-emerald-400 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="text-white font-bold tracking-tight">Fin</span>
              <span className="text-emerald-400 font-bold tracking-tight">Hub</span>
              <div className="text-slate-500 text-[9px] uppercase tracking-widest -mt-0.5">Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                }
              `}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — admin info + logout */}
        <div className="p-2 border-t border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-xs font-bold">
                  {admin?.email?.[0]?.toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-slate-300 text-xs font-medium truncate">{admin?.email}</p>
                <p className="text-slate-600 text-[10px]">Administrator</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slate-400 hover:text-red-400 hover:bg-red-500/10
              border border-transparent hover:border-red-500/20
              transition-all duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && (loggingOut ? "Logging out…" : "Logout")}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center px-6 gap-4 flex-shrink-0">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page title — reads from current route */}
          <div className="flex-1">
            <h1 className="text-white font-semibold text-sm capitalize">
              {location.pathname.split("/").pop()}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">
                {admin?.email?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}