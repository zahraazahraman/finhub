import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";

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
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}