const BASE = "/api/admin-notifications";

export default class AdminNotificationsDAL {
  static async getAll() {
    const res = await fetch(BASE, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }

  static async getUnreadCount() {
    const res = await fetch(`${BASE}/unread-count`, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }

  static async getRecent() {
    const res = await fetch(`${BASE}/recent`, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }

  static async markRead(id) {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      credentials: "include",
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async markAllRead() {
    const res = await fetch(`${BASE}/mark-all-read`, {
      method: "PATCH",
      credentials: "include",
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async delete(id) {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return { ok: res.ok, data: await res.json() };
  }
}