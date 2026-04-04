import api from "../utils/api.js";

export default class AccountsDAL {
  static async getAll() {
    return await api.get("/accounts");
  }

  static async create(data) {
    return await api.post("/accounts", data);
  }

  static async remove(id) {
    return await api.delete(`/accounts?id=${id}`);
  }
}
