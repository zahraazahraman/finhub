import { createContext, useContext, useState } from "react";
import AuthBLL from "../bll/AuthBLL.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(
    () => JSON.parse(localStorage.getItem("finhub_admin")) || null
  );

  const login = (userData) => {
    setAdmin(userData);
    localStorage.setItem("finhub_admin", JSON.stringify(userData));
  };

  const logout = async () => {
    await AuthBLL.logout();
    setAdmin(null);
    localStorage.removeItem("finhub_admin");
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}