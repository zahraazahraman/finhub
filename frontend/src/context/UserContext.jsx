import { createContext, useContext, useState, useEffect, useRef } from "react";
import { setUnauthorizedHandler } from "../utils/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("finhub_user")) || null
  );

  // Keep a ref in sync so the 401 handler (registered once on mount)
  // always reads the current user without needing to re-register.
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Register the global 401 handler once on mount.
  // When any protected endpoint returns 401 (PHP session expired, token gone, etc.),
  // clear local state and send the user to /login.
  // The userRef guard prevents this from firing on login failures,
  // which also return 401 but happen before any user is stored.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!userRef.current) return;
      setUser(null);
      localStorage.removeItem("finhub_user");
      window.location.href = "/login";
    });
  }, []);

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
    <UserContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}