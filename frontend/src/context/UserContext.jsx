import { createContext, useContext, useState, useEffect, useRef } from "react";
import { setUnauthorizedHandler, setDemoBlockHandler } from "../utils/api";
import api from "../utils/api";
import DemoModal from "../components/common/DemoModal.jsx";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("finhub_user")) || null
  );
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Register the global 401 handler once on mount.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!userRef.current) return;
      setUser(null);
      localStorage.removeItem("finhub_user");
      window.location.href = "/login";
    });
  }, []);

  // Arm the demo block handler whenever a demo session is active.
  // Keyed on email so it works even if the stored user object predates the is_demo flag.
  useEffect(() => {
    if (user?.email === "demo@finhub.app") {
      setDemoBlockHandler(() => setDemoModalOpen(true));
    } else {
      setDemoBlockHandler(null);
    }
  }, [user?.email]);

  // Silently sync timezone on mount.
  // If the user has moved to a different timezone since their last login
  // (e.g. they travelled), update the stored value so reminder dates stay correct.
  useEffect(() => {
    if (!userRef.current) return;

    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected || detected === userRef.current.timezone) return;

    api.post("/auth/sync-timezone", { timezone: detected }).then(({ ok }) => {
      if (!ok) return;
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, timezone: detected };
        localStorage.setItem("finhub_user", JSON.stringify(next));
        return next;
      });
    });
  }, []); // intentionally empty — run once on mount only

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("finhub_user", JSON.stringify(userData));
  };

  // Merge a partial update into the stored user object.
  // Called by the profile page after a successful save so the topbar,
  // sidebar avatar, and any other consumer immediately reflect the change.
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("finhub_user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finhub_user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, isDemo: user?.email === "demo@finhub.app" }}>
      {children}
      {demoModalOpen && <DemoModal onClose={() => setDemoModalOpen(false)} />}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}