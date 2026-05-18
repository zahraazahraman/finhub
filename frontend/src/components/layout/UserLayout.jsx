import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { UserNotificationProvider, useUserNotifications } from "../../context/UserNotificationContext.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import UserNotificationBell from "../common/UserNotificationBell.jsx";
import Modal from "../ui/Modal.jsx";

const NAV_ITEMS = [
  {
    path: "/dashboard",
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
    path: "/accounts",
    label: "My Accounts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    path: "/goals",
    label: "Goals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    path: "/investments",
    label: "Investments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    path: "/consultants",
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
    path: "/reminders",
    label: "Reminders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    path: "/notifications",
    label: "Notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "Profile & Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

const BOTTOM_NAV = [
  { path: "/dashboard",     label: "Home",          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { path: "/accounts",      label: "Accounts",      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
  { path: "/goals",         label: "Goals",         icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { path: "/notifications",  label: "Alerts",        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
];

const MORE_ITEMS = [
  { path: "/investments",  label: "Investments",      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { path: "/consultants",  label: "Consultants",      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg> },
  { path: "/reminders",    label: "Reminders",        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { path: "/profile",      label: "Profile",          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
];

// Inner layout — has access to UserNotificationContext
function UserLayoutInner() {
  const [collapsed, setCollapsed]             = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu]       = useState(false);
  const { user, logout }                      = useUser();
  const { unreadCount }                       = useUserNotifications();
  const navigate                              = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen bg-skin-base flex overflow-hidden">

      {/* ── Sidebar — hidden on mobile ── */}
      <aside className={`
        hidden md:flex flex-col bg-skin-sidebar border-r border-skin-border
        transition-all duration-300 ease-in-out flex-shrink-0 h-screen sticky top-0
        ${collapsed ? "w-16" : "w-60"}
      `}
      style={{ boxShadow: "var(--shadow-sm)" }}>

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
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover border border-transparent"
                }
              `}
            >
              <span className="relative flex-shrink-0">
                {item.icon}
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </span>
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between">
                  {item.label}
                  {item.path === "/notifications" && unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-500 rounded-full px-1.5 py-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — avatar links to /profile */}
        <div className="p-2 border-t border-skin-border">
          {!collapsed && (
            <NavLink
              to="/profile"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 mb-1 rounded-xl
                transition-all duration-150
                ${isActive ? "bg-emerald-500/10" : "hover:bg-skin-hover"}
              `}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-500 text-xs font-bold">
                  {user?.first_name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-skin-text text-xs font-medium truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-skin-text-muted text-[10px]">{user?.email}</p>
              </div>
            </NavLink>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-skin-text-secondary hover:text-red-500 hover:bg-red-500/10
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
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header
          className="h-16 bg-skin-topbar border-b border-skin-border flex items-center px-4 md:px-6 gap-4 flex-shrink-0 backdrop-blur-sm"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {/* Sidebar toggle — desktop only */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex text-skin-text-secondary hover:text-skin-text transition-colors p-1.5 rounded-lg hover:bg-skin-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo — mobile only */}
          <div className="flex md:hidden items-center gap-2">
            <div className="relative w-7 h-7 flex-shrink-0">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg rotate-6 opacity-30" />
              <div className="absolute inset-0 bg-emerald-400 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <span className="font-bold text-skin-text tracking-tight">Fin<span className="text-emerald-500">Hub</span></span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserNotificationBell />
            <span className="text-skin-text-secondary text-sm hidden md:block">
              {user?.first_name} {user?.last_name}
            </span>
            <NavLink to="/profile">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center hover:ring-2 hover:ring-emerald-500/40 transition-all">
                <span className="text-emerald-500 text-xs font-bold">
                  {user?.first_name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for the tab bar */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-skin-sidebar border-t border-skin-border z-40 flex items-stretch"
           style={{ boxShadow: "0 -1px 0 var(--border)" }}>
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors
              ${isActive ? "text-emerald-500" : "text-skin-text-muted"}
            `}
          >
            <span className="relative">
              {item.icon}
              {item.path === "/notifications" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
        {/* More button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-skin-text-muted"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>
          </svg>
          More
        </button>
      </nav>

      {/* ── Mobile "More" slide-up sheet ── */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowMoreMenu(false)} />
          <div className="bg-skin-card rounded-t-2xl border-t border-skin-border p-4 space-y-1"
               style={{ boxShadow: "var(--shadow-lg)" }}>
            <div className="w-10 h-1 bg-skin-border rounded-full mx-auto mb-4" />
            {MORE_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setShowMoreMenu(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? "bg-emerald-500/10 text-emerald-500" : "text-skin-text hover:bg-skin-hover"}
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => { setShowMoreMenu(false); setShowLogoutModal(true); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <Modal
          title="Sign out?"
          description="You will be redirected to the login page."
          showFooter
          confirmLabel="Sign Out"
          confirmVariant="danger"
          onConfirm={handleLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}

export default function UserLayout() {
  return (
    <UserNotificationProvider>
      <UserLayoutInner />
    </UserNotificationProvider>
  );
}