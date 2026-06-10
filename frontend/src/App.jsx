import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { InvestmentAnalysisProvider } from "./context/InvestmentAnalysisContext.jsx";
import { ConsultantAuthProvider } from "./context/ConsultantAuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import UserProtectedRoute from "./components/common/UserProtectedRoute.jsx";
import ConsultantProtectedRoute from "./components/common/ConsultantProtectedRoute.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import BecomeConsultantPage from "./pages/BecomeConsultantPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserLoginPage from "./pages/UserLoginPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ConsultantLoginPage from "./pages/ConsultantLoginPage.jsx";
import ConsultantChangePasswordPage from "./pages/ConsultantChangePasswordPage.jsx";
import DemoLoginPage from "./pages/DemoLoginPage.jsx";

// Admin pages
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import Users from "./admin/Users.jsx";
import Consultants from "./admin/Consultants.jsx";
import ConsultantApplications from "./admin/ConsultantApplications.jsx";
import Categories from "./admin/Categories.jsx";
import AdminNotifications from "./admin/AdminNotifications.jsx";
import UserNotifications from "./admin/UserNotifications.jsx";

// Consultant pages
import ConsultantLayout from "./components/layout/ConsultantLayout.jsx";
import ConsultantDashboard from "./consultant/ConsultantDashboard.jsx";
import ConsultantInquiries from "./consultant/ConsultantInquiries.jsx";

// User pages
import UserLayout from "./components/layout/UserLayout.jsx";
import UserDashboard from "./user/UserDashboard.jsx";
import Accounts from "./user/Accounts.jsx";
import Goals from "./user/Goals.jsx";
import Investments from "./user/Investments.jsx";
import UserConsultants from "./user/UserConsultants.jsx";
import Reminders from "./user/Reminders.jsx";
import UserNotificationsPage from "./user/UserNotificationsPage.jsx";
import Profile from "./user/Profile.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <UserProvider>
              <InvestmentAnalysisProvider>
                <ConsultantAuthProvider>
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/become-a-consultant" element={<BecomeConsultantPage />} />
                    <Route path="/login" element={<UserLoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage role="user" />} />
                    <Route path="/reset-password" element={<ResetPasswordPage role="user" />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/forgot-password" element={<ForgotPasswordPage role="admin" />} />
                    <Route path="/admin/reset-password" element={<ResetPasswordPage role="admin" />} />
                    <Route path="/consultant/login" element={<ConsultantLoginPage />} />
                    <Route path="/consultant/change-password" element={<ConsultantChangePasswordPage />} />
                    <Route path="/demo" element={<DemoLoginPage />} />

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
                      <Route path="consultant-applications" element={<ConsultantApplications />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                      <Route path="user-notifications" element={<UserNotifications />} />
                    </Route>

                    {/* Consultant - protected */}
                    <Route
                      path="/consultant"
                      element={
                        <ConsultantProtectedRoute>
                          <ConsultantLayout />
                        </ConsultantProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<ConsultantDashboard />} />
                      <Route path="inquiries" element={<ConsultantInquiries />} />
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
                      <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ConsultantAuthProvider>
              </InvestmentAnalysisProvider>
            </UserProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
