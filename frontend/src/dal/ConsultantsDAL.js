import api from "../utils/api.js";

export default class ConsultantsDAL {
  static async getAll() {
    return await api.get("/consultants");
  }

  static async create(payload) {
    return await api.post("/consultants", payload);
  }

  static async update(id, payload) {
    return await api.put(`/consultants/${id}`, payload);
  }

  static async delete(id) {
    return await api.delete(`/consultants/${id}`);
  }
}
