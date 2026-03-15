const BASE = "/api/users";

export default class UsersDAL {
  static async getAll() {
    const res = await fetch(BASE, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }

  static async updateStatus(userId, status) {
    const res = await fetch(`${BASE}/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async delete(userId) {
    const res = await fetch(`${BASE}/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return { ok: res.ok, data: await res.json() };
  }
}