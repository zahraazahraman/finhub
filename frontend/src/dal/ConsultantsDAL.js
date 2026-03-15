const BASE = "/api/consultants";

export default class ConsultantsDAL {
  static async getAll() {
    const res = await fetch(BASE, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }

  static async create(payload) {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async update(id, payload) {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
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