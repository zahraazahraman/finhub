import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import UserProtectedRoute from "./components/common/UserProtectedRoute.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserLoginPage from "./pages/UserLoginPage.jsx";

// Admin pages
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import Users from "./admin/Users.jsx";
import Consultants from "./admin/Consultants.jsx";
import Categories from "./admin/Categories.jsx";
import AdminNotifications from "./admin/AdminNotifications.jsx";
import UserNotifications from "./admin/UserNotifications.jsx";

// User pages
import UserLayout from "./components/layout/UserLayout.jsx";
import UserDashboard from "./user/UserDashboard.jsx";
import Accounts from "./user/Accounts.jsx";
import Goals from "./user/Goals.jsx";
import Investments from "./user/Investments.jsx";
import UserConsultants from "./user/UserConsultants.jsx";
import Reminders from "./user/Reminders.jsx";
import UserNotificationsPage from "./user/UserNotificationsPage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <UserProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<UserLoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin - protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="consultants" element={<Consultants />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="user-notifications" element={<UserNotifications />} />
                </Route>

                {/* User - protected */}
                <Route
                  path="/"
                  element={
                    <UserProtectedRoute>
                      <UserLayout />
                    </UserProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="investments" element={<Investments />} />
                  <Route path="consultants" element={<UserConsultants />} />
                  <Route path="reminders" element={<Reminders />} />
                  <Route path="notifications" element={<UserNotificationsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </UserProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}