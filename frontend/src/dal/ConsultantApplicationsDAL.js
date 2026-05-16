import api from "../utils/api.js";

export default class ConsultantApplicationsDAL {
  static async getAll() {
    return await api.get("/consultant-applications");
  }

  static async getById(id) {
    return await api.get(`/consultant-applications?id=${id}`);
  }

  static async updateStatus(id, status, adminNote = null) {
    return await api.patch(`/consultant-applications/${id}`, { status, admin_note: adminNote });
  }
}
