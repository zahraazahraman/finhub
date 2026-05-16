import ConsultantApplicationsDAL from "../dal/ConsultantApplicationsDAL.js";

export default class ConsultantApplicationsBLL {
  static async getAll() {
    const { ok, data } = await ConsultantApplicationsDAL.getAll();
    if (ok && data.success) return { success: true, applications: data.applications };
    return { success: false, message: data?.message || "Failed to load applications." };
  }

  static async getById(id) {
    const { ok, data } = await ConsultantApplicationsDAL.getById(id);
    if (ok && data.success) return { success: true, application: data.application };
    return { success: false, message: data?.message || "Application not found." };
  }

  static async approve(id, adminNote = null) {
    const { ok, data } = await ConsultantApplicationsDAL.updateStatus(id, "approved", adminNote);
    if (ok && data.success) return { success: true };
    return { success: false, message: data?.message || "Failed to approve application." };
  }

  static async reject(id, adminNote = null) {
    const { ok, data } = await ConsultantApplicationsDAL.updateStatus(id, "rejected", adminNote);
    if (ok && data.success) return { success: true };
    return { success: false, message: data?.message || "Failed to reject application." };
  }
}
