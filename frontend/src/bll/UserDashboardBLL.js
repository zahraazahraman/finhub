import UserDashboardDAL from "../dal/UserDashboardDAL.js";

export default class UserDashboardBLL {
    static async getSummary(params = {}) {
        const { ok, data } = await UserDashboardDAL.getSummary(params);
        if (ok && data.success) return { success: true, ...data };
        return { success: false, error: "Failed to load dashboard data." };
    }
}