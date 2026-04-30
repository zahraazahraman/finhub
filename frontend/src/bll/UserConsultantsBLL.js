import UserConsultantsDAL from "../dal/UserConsultantsDAL.js";

export default class UserConsultantsBLL {
  static async getAll(specialization = null) {
    const { ok, data } = await UserConsultantsDAL.getAll(specialization);
    if (ok && data.success) return { success: true, consultants: data.consultants };
    return { success: false, error: data.message || "Failed to load consultants." };
  }

  static async getSpecializations() {
    const { ok, data } = await UserConsultantsDAL.getSpecializations();
    if (ok && data.success) return { success: true, specializations: data.specializations };
    return { success: false, error: data.message || "Failed to load specializations." };
  }
}