import AdminNotificationsDAL from "../dal/AdminNotificationsDAL.js";

export default class AdminNotificationsBLL {
  static async getAll() {
    try {
      const { ok, data } = await AdminNotificationsDAL.getAll();
      if (ok) return { success: true, notifications: Array.isArray(data) ? data : [] };
      return { success: false, error: "Failed to load notifications." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async getUnreadCount() {
    try {
      const { ok, data } = await AdminNotificationsDAL.getUnreadCount();
      if (ok) return { success: true, count: data.count };
      return { success: false, count: 0 };
    } catch {
      return { success: false, count: 0 };
    }
  }

  static async getRecent() {
    try {
      const { ok, data } = await AdminNotificationsDAL.getRecent();
      if (ok) return { success: true, notifications: Array.isArray(data) ? data : (data.notifications ?? []) };
      return { success: false, notifications: [] };
    } catch {
      return { success: false, notifications: [] };
    }
  }

  static async markRead(id) {
    try {
      const { ok, data } = await AdminNotificationsDAL.markRead(id);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async markAllRead() {
    try {
      const { ok, data } = await AdminNotificationsDAL.markAllRead();
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async delete(id) {
    try {
      const { ok, data } = await AdminNotificationsDAL.delete(id);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }
}