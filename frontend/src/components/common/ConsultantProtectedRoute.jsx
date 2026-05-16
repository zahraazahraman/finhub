import { Navigate } from "react-router-dom";
import { useConsultantAuth } from "../../context/ConsultantAuthContext.jsx";

export default function ConsultantProtectedRoute({ children }) {
  const { consultant, loading } = useConsultantAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-skin-base">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!consultant) return <Navigate to="/consultant/login" replace />;

  if (consultant.must_change_password) {
    return <Navigate to="/consultant/change-password" replace />;
  }

  return children;
}
