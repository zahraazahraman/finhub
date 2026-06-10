import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../utils/api";
import Spinner from "../components/ui/Spinner";

export default function DemoLoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    api.post("/auth/demo-login", {}).then(({ ok, data }) => {
      if (ok && data?.user) {
        login(data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setError(true);
      }
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Demo is currently unavailable.
        </p>
        <Link to="/login" className="text-emerald-600 hover:underline text-sm">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
      <Spinner size="lg" />
      <p className="text-gray-500 dark:text-gray-400 text-sm tracking-wide">
        Entering demo…
      </p>
    </div>
  );
}
