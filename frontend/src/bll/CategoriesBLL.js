import CategoriesDAL from "../dal/CategoriesDAL.js";
import { validators } from "../utils/validators.js";

export default class CategoriesBLL {
  static async getAll() {
    const { ok, data } = await CategoriesDAL.getAll();
    if (ok) return { success: true, categories: data };
    return { success: false, error: "Failed to load categories." };
  }

  static async create(payload) {
    const nameError = validators.required(payload.name, "Category name");
    if (nameError) return { success: false, error: nameError };
    if (!["income", "expense"].includes(payload.type))
      return { success: false, error: "Type must be income or expense." };

    const { ok, data } = await CategoriesDAL.create(payload);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Create failed." };
  }

  static async delete(id) {
    const { ok, data } = await CategoriesDAL.delete(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Delete failed." };
  }
}
