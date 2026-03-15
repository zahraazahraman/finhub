import UserNotificationsDAL from "../dal/UserNotificationsDAL.js";

export default class UserNotificationsBLL {
  static async getAll() {
    try {
      const { ok, data } = await UserNotificationsDAL.getAll();
      if (ok) return { success: true, notifications: Array.isArray(data) ? data : [] };
      return { success: false, error: "Failed to load notifications." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async delete(id) {
    try {
      const { ok, data } = await UserNotificationsDAL.delete(id);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Delete failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }
}
