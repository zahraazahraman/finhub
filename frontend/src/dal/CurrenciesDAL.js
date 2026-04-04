import api from "../utils/api.js";

export default class CurrenciesDAL {
  static async getAll() {
    return await api.get("/currencies");
  }
}
