import api from "../utils/api.js";

export default class TransactionsDAL {
  static async getByAccount(accountId) {
    return await api.get(`/transactions?account_id=${accountId}`);
  }

  static async create(data) {
    return await api.post("/transactions", data);
  }

  static async remove(id) {
    return await api.delete(`/transactions?id=${id}`);
  }
}
