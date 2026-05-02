import api from "../utils/api.js";

export default class MyNotificationsDAL {
  static async getAll() {
    return await api.get("/my-notifications");
  }

  static async getRecent() {
    return await api.get("/my-notifications?action=recent");
  }

  static async getUnreadCount() {
    return await api.get("/my-notifications?action=unread_count");
  }

  static async markRead(id) {
    return await api.patch(`/my-notifications/${id}`);
  }

  static async markAllRead() {
    return await api.patch("/my-notifications/mark-all-read");
  }

  static async delete(id) {
    return await api.delete(`/my-notifications/${id}`);
  }
}