import AdminNotificationsDAL from "../dal/AdminNotificationsDAL.js";

export default class AdminNotificationsBLL {
  static async getAll() {
    const { ok, data } = await AdminNotificationsDAL.getAll();
    if (ok) return { success: true, notifications: Array.isArray(data) ? data : [] };
    return { success: false, error: "Failed to load notifications." };
  }

  static async getUnreadCount() {
    const { ok, data } = await AdminNotificationsDAL.getUnreadCount();
    if (ok) return { success: true, count: data.count };
    return { success: false, count: 0 };
  }

  static async getRecent() {
    const { ok, data } = await AdminNotificationsDAL.getRecent();
    if (ok) return { success: true, notifications: Array.isArray(data) ? data : (data.notifications ?? []) };
    return { success: false, notifications: [] };
  }

  static async markRead(id) {
    const { ok, data } = await AdminNotificationsDAL.markRead(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed." };
  }

  static async markAllRead() {
    const { ok, data } = await AdminNotificationsDAL.markAllRead();
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed." };
  }

  static async delete(id) {
    const { ok, data } = await AdminNotificationsDAL.delete(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed." };
  }
}
