import UserNotificationsDAL from "../dal/UserNotificationsDAL.js";

export default class UserNotificationsBLL {
  static async getAll() {
    const { ok, data } = await UserNotificationsDAL.getAll();
    if (ok) return { success: true, notifications: Array.isArray(data) ? data : [] };
    return { success: false, error: "Failed to load notifications." };
  }

  static async delete(id) {
    const { ok, data } = await UserNotificationsDAL.delete(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Delete failed." };
  }
}