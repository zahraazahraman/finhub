import ConsultantsDAL from "../dal/ConsultantsDAL.js";

export default class ConsultantsBLL {
  static async getAll() {
    try {
      const { ok, data } = await ConsultantsDAL.getAll();
      if (ok) return { success: true, consultants: data };
      return { success: false, error: "Failed to load consultants." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async create(payload) {
    try {
      const { ok, data } = await ConsultantsDAL.create(payload);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Create failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async update(id, payload) {
    try {
      const { ok, data } = await ConsultantsDAL.update(id, payload);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Update failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async delete(id) {
    try {
      const { ok, data } = await ConsultantsDAL.delete(id);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Delete failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }
}