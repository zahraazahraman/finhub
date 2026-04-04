import DashboardDAL from "../dal/DashboardDAL.js";

export default class DashboardBLL {
  static async getSummary(year, from = null, to = null) {
    const { ok, data } = await DashboardDAL.getSummary(year, from, to);
    if (ok && data.success) return { success: true, ...data };
    return { success: false, error: "Failed to load dashboard data." };
  }
}
