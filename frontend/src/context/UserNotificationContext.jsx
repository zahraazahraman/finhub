import { createContext, useContext, useState, useCallback } from "react";
import MyNotificationsBLL from "../bll/MyNotificationsBLL.js";

const UserNotificationContext = createContext(null);

export function UserNotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const result = await MyNotificationsBLL.getUnreadCount();
    if (result.success) setUnreadCount(result.count);
  }, []);

  return (
    <UserNotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount }}>
      {children}
    </UserNotificationContext.Provider>
  );
}

export function useUserNotifications() {
  return useContext(UserNotificationContext);
}