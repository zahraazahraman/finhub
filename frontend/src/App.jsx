import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserLoginPage from "./pages/UserLoginPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";


// Admin pages
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import Users from "./admin/Users.jsx";
import Consultants from "./admin/Consultants.jsx";
import Categories from "./admin/Categories.jsx";
import AdminNotifications from "./admin/AdminNotifications.jsx";
import UserNotifications from "./admin/UserNotifications.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<ComingSoon />} />

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}