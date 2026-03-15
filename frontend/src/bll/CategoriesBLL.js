import CategoriesDAL from "../dal/CategoriesDAL.js";

export default class CategoriesBLL {
  static async getAll() {
    try {
      const { ok, data } = await CategoriesDAL.getAll();
      if (ok) return { success: true, categories: data };
      return { success: false, error: "Failed to load categories." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async create(payload) {
    if (!payload.name?.trim())
      return { success: false, error: "Category name is required." };
    if (!["income", "expense"].includes(payload.type))
      return { success: false, error: "Type must be income or expense." };
    try {
      const { ok, data } = await CategoriesDAL.create(payload);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Create failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }

  static async delete(id) {
    try {
      const { ok, data } = await CategoriesDAL.delete(id);
      if (ok && data.success) return { success: true };
      return { success: false, error: data.message || "Delete failed." };
    } catch {
      return { success: false, error: "Network error." };
    }
  }
}