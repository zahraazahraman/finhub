import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useConsultantAuth } from "../../context/ConsultantAuthContext.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Modal from "../ui/Modal.jsx";

const navItems = [
  {
    path: "/consultant/dashboard",
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
    path: "/consultant/inquiries",
    label: "Inquiries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function ConsultantLayout() {
  const [collapsed, setCollapsed]         = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut]       = useState(false);
  const { consultant, logout }            = useConsultantAuth();
  const navigate                          = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutModal(false);
    await logout();
    navigate("/consultant/login");
  };

  return (
    <div className="h-screen bg-skin-base flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-skin-sidebar border-r border-skin-border transition-all duration-300 ease-in-out flex-shrink-0 h-screen sticky top-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-skin-border flex-shrink-0 ${collapsed ? "justify-center" : ""}`}>
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
              <span className="text-skin-text font-bold tracking-tight">Fin</span>
              <span className="text-emerald-500 font-bold tracking-tight">Hub</span>
              <div className="text-skin-text-muted text-[9px] uppercase tracking-widest -mt-0.5">
                Consultant
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
                ${isActive
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
                  {consultant?.first_name?.[0]?.toUpperCase() ?? "C"}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-skin-text text-xs font-medium truncate">
                  {consultant?.first_name} {consultant?.last_name}
                </p>
                <p className="text-skin-text-muted text-[10px] truncate">{consultant?.specialization}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-skin-text-secondary hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 bg-skin-topbar border-b border-skin-border flex items-center px-6 gap-4 flex-shrink-0"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-skin-text-secondary hover:text-skin-text transition-colors p-1.5 rounded-lg hover:bg-skin-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-500 text-xs font-bold">
              {consultant?.first_name?.[0]?.toUpperCase() ?? "C"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
        <Modal
          title="Sign out?"
          description="You will be redirected to the consultant login page."
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
