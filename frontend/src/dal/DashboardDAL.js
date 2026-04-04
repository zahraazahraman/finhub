import api from "../utils/api.js";

export default class DashboardDAL {
  static async getSummary(year, from = null, to = null) {
    const params = new URLSearchParams({ year });
    if (from) params.append("from", from);
    if (to)   params.append("to", to);
    return await api.get(`/dashboard?${params.toString()}`);
  }
}
