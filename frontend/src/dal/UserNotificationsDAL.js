const BASE = "/api/user-notifications";

export default class UserNotificationsDAL {
  static async getAll() {
    const res = await fetch(BASE, { credentials: "include" });
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
