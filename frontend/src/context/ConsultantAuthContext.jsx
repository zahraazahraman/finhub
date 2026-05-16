import { createContext, useContext, useState, useEffect } from "react";

const ConsultantAuthContext = createContext(null);

async function fetchMe() {
  try {
    const res = await fetch("/api/auth/consultant-me", { credentials: "include" });
    const data = await res.json();
    return res.ok && data.success ? data.consultant : null;
  } catch {
    return null;
  }
}

export function ConsultantAuthProvider({ children }) {
  const [consultant, setConsultant] = useState(undefined); // undefined = loading

  useEffect(() => {
    fetchMe().then(setConsultant);
  }, []);

  const login = (consultantData) => setConsultant(consultantData);

  const logout = async () => {
    try {
      await fetch("/api/auth/consultant-logout", { method: "POST", credentials: "include" });
    } catch {}
    setConsultant(null);
  };

  const clearMustChange = () =>
    setConsultant((prev) => prev ? { ...prev, must_change_password: 0 } : prev);

  return (
    <ConsultantAuthContext.Provider
      value={{ consultant, login, logout, clearMustChange, loading: consultant === undefined }}
    >
      {children}
    </ConsultantAuthContext.Provider>
  );
}

export function useConsultantAuth() {
  return useContext(ConsultantAuthContext);
}
