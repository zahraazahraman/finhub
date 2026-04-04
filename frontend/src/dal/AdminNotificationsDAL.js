import api from "../utils/api.js";

export default class AdminNotificationsDAL {
  static async getAll() {
    return await api.get("/admin-notifications");
  }

  static async getUnreadCount() {
    return await api.get("/admin-notifications/unread-count");
  }

  static async getRecent() {
    return await api.get("/admin-notifications/recent");
  }

  static async markRead(id) {
    return await api.patch(`/admin-notifications/${id}`, {});
  }

  static async markAllRead() {
    return await api.patch("/admin-notifications/mark-all-read", {});
  }

  static async delete(id) {
    return await api.delete(`/admin-notifications/${id}`);
  }
}
