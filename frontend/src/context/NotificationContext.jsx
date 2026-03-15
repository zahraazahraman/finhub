import { createContext, useContext, useState, useCallback } from "react";
import AdminNotificationsBLL from "../bll/AdminNotificationsBLL.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const result = await AdminNotificationsBLL.getUnreadCount();
    if (result.success) setUnreadCount(result.count);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
