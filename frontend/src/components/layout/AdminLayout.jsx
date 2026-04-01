import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "../common/NotificationBell.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Modal from "../ui/Modal.jsx";

const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    path: "/admin/consultants",
    label: "Consultants",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-skin-card border border-skin-border rounded-2xl p-6 w-full max-w-sm animate-scale-in"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h3 className="text-skin-text font-semibold mb-1">Sign out?</h3>
        <p className="text-skin-text-secondary text-sm mb-6">
          You will be redirected to the login page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-skin-border text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-skin-text text-sm font-medium transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutModal(false);
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="h-screen bg-skin-base flex overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`
        flex flex-col bg-skin-sidebar border-r border-skin-border
        transition-all duration-300 ease-in-out flex-shrink-0 h-screen sticky top-0
        ${collapsed ? "w-16" : "w-60"}
      `}
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 h-16 border-b border-skin-border flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500 rounded-lg rotate-6 opacity-30" />
            <div className="absolute inset-0 bg-emerald-400 rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-slate-900"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="text-skin-text font-bold tracking-tight">
                Fin
              </span>
              <span className="text-emerald-500 font-bold tracking-tight">
                Hub
              </span>
              <div className="text-skin-text-muted text-[9px] uppercase tracking-widest -mt-0.5">
                Admin
              </div>
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
                transition-all duration-150
                ${collapsed ? "justify-center" : ""}
                ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover border border-transparent"
                }
              `}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-skin-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-500 text-xs font-bold">
                  {admin?.email?.[0]?.toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-skin-text text-xs font-medium truncate">
                  {admin?.email}
                </p>
                <p className="text-skin-text-muted text-[10px]">
                  Administrator
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-skin-text-secondary hover:text-red-500 hover:bg-red-500/10
              border border-transparent hover:border-red-500/20
              transition-all duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
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
        <header
          className="h-16 bg-skin-topbar border-b border-skin-border flex items-center px-6 gap-4 flex-shrink-0 backdrop-blur-sm"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-skin-text-secondary hover:text-skin-text transition-colors p-1.5 rounded-lg hover:bg-skin-hover"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-skin-text font-semibold text-sm capitalize">
              {location.pathname.split("/").pop()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-500 text-xs font-bold">
                {admin?.email?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
      <Modal
        title="Sign out?"
        description="You will be redirected to the login page."
        showFooter
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
        loading={loggingOut}
      />
    )}
    </div>
  );
}
