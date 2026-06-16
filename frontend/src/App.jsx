import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const BecomeConsultantPage = lazy(() => import("./pages/BecomeConsultantPage.jsx"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const UserLoginPage = lazy(() => import("./pages/UserLoginPage.jsx"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
const ConsultantLoginPage = lazy(() => import("./pages/ConsultantLoginPage.jsx"));
const ConsultantChangePasswordPage = lazy(() => import("./pages/ConsultantChangePasswordPage.jsx"));
const DemoLoginPage = lazy(() => import("./pages/DemoLoginPage.jsx"));

// Admin pages
const AdminLayout = lazy(() => import("./components/layout/AdminLayout.jsx"));
const Dashboard = lazy(() => import("./admin/Dashboard.jsx"));
const Users = lazy(() => import("./admin/Users.jsx"));
const Consultants = lazy(() => import("./admin/Consultants.jsx"));
const ConsultantApplications = lazy(() => import("./admin/ConsultantApplications.jsx"));
const Categories = lazy(() => import("./admin/Categories.jsx"));
const AdminNotifications = lazy(() => import("./admin/AdminNotifications.jsx"));
const UserNotifications = lazy(() => import("./admin/UserNotifications.jsx"));

// Consultant pages
const ConsultantLayout = lazy(() => import("./components/layout/ConsultantLayout.jsx"));
const ConsultantDashboard = lazy(() => import("./consultant/ConsultantDashboard.jsx"));
const ConsultantInquiries = lazy(() => import("./consultant/ConsultantInquiries.jsx"));

// User pages
const UserLayout = lazy(() => import("./components/layout/UserLayout.jsx"));
const UserDashboard = lazy(() => import("./user/UserDashboard.jsx"));
const Accounts = lazy(() => import("./user/Accounts.jsx"));
const Goals = lazy(() => import("./user/Goals.jsx"));
const Investments = lazy(() => import("./user/Investments.jsx"));
const UserConsultants = lazy(() => import("./user/UserConsultants.jsx"));
const Reminders = lazy(() => import("./user/Reminders.jsx"));
const UserNotificationsPage = lazy(() => import("./user/UserNotificationsPage.jsx"));
const Profile = lazy(() => import("./user/Profile.jsx"));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <UserProvider>
              <InvestmentAnalysisProvider>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
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

                    {/* Consultant - auth context scoped here so it only fires on /consultant/* */}
                    <Route element={<ConsultantAuthProvider><Outlet /></ConsultantAuthProvider>}>
                      <Route path="/consultant/login" element={<ConsultantLoginPage />} />
                      <Route path="/consultant/change-password" element={<ConsultantChangePasswordPage />} />
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
                  </Suspense>
              </InvestmentAnalysisProvider>
            </UserProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
