import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";

export default function UserProtectedRoute({ children }) {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}