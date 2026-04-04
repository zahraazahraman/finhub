import api from "../utils/api.js";

export default class CategoriesDAL {
  static async getAll() {
    return await api.get("/categories");
  }

  static async create(payload) {
    return await api.post("/categories", payload);
  }

  static async delete(id) {
    return await api.delete(`/categories/${id}`);
  }
}
