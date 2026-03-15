const BASE = "/api/dashboard";

export default class DashboardDAL {
  static async getSummary(year, from = null, to = null) {
    const params = new URLSearchParams({ year });
    if (from) params.append("from", from);
    if (to)   params.append("to", to);
    const res = await fetch(`${BASE}?${params.toString()}`, { credentials: "include" });
    return { ok: res.ok, data: await res.json() };
  }
}
