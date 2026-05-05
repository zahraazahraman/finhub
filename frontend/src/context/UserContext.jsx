import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(sessionStorage.getItem("finhub_user")) || null
  );

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("finhub_user", JSON.stringify(userData));
  };

  // Merge a partial update into the stored user object.
  // Called by the profile page after a successful save so the topbar,
  // sidebar avatar, and any other consumer immediately reflect the change.
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      sessionStorage.setItem("finhub_user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("finhub_user");
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