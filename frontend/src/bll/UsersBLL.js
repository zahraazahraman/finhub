import UsersDAL from "../dal/UsersDAL.js";

export default class UsersBLL {
  static async getAll() {
    try {
      const { ok, data } = await UsersDAL.getAll();
      if (ok) return { success: true, users: data };
      return { success: false, error: "Failed to load users." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async updateStatus(userId, status) {
    const allowed = ["active", "inactive", "suspended"];
    if (!allowed.includes(status))
      return { success: false, error: "Invalid status value." };
    try {
      const { ok, data } = await UsersDAL.updateStatus(userId, status);
      if (ok) return { success: true };
      return { success: false, error: data.message || "Update failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async delete(userId) {
    try {
      const { ok, data } = await UsersDAL.delete(userId);
      if (ok) return { success: true };
      return { success: false, error: data.message || "Delete failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }
}