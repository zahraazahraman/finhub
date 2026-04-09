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

  static async import(accountId, file) {
    const formData = new FormData();
    formData.append("account_id", accountId);
    formData.append("file", file);
    return await api.upload("/transactions/import", formData);
  }

  static async scanReceipt(image) {
    const formData = new FormData();
    formData.append("image", image);
    return await api.upload("/transactions/scan-receipt", formData);
  }
}
