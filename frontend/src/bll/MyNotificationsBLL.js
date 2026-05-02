import MyNotificationsDAL from "../dal/MyNotificationsDAL.js";

export default class MyNotificationsBLL {
  static async getAll() {
    const { ok, data } = await MyNotificationsDAL.getAll();
    if (ok) return { success: true, notifications: Array.isArray(data?.notifications) ? data.notifications : [] };
    return { success: false, error: "Failed to load notifications." };
  }

  static async getRecent() {
    const { ok, data } = await MyNotificationsDAL.getRecent();
    if (ok) return { success: true, notifications: Array.isArray(data?.notifications) ? data.notifications : [] };
    return { success: false, error: "Failed to load notifications." };
  }

  static async getUnreadCount() {
    const { ok, data } = await MyNotificationsDAL.getUnreadCount();
    if (ok && data?.success) return { success: true, count: data.count ?? 0 };
    return { success: false, count: 0 };
  }

  static async markRead(id) {
    const { ok, data } = await MyNotificationsDAL.markRead(id);
    if (ok && data?.success) return { success: true };
    return { success: false, error: "Failed to mark as read." };
  }

  static async markAllRead() {
    const { ok, data } = await MyNotificationsDAL.markAllRead();
    if (ok && data?.success) return { success: true };
    return { success: false, error: "Failed to mark all as read." };
  }

  static async delete(id) {
    const { ok, data } = await MyNotificationsDAL.delete(id);
    if (ok && data?.success) return { success: true };
    return { success: false, error: data?.message || "Delete failed." };
  }
}