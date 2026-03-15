const BASE = "/api/auth";

export default class AuthDAL {
  static async loginRequest(email, password) {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return { ok: res.ok, data: await res.json() };
  }

  static async logoutRequest() {
    const res = await fetch(`${BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    return { ok: res.ok };
  }
}