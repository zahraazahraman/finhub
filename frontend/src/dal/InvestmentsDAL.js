import api from "../utils/api.js";

export default class InvestmentsDAL {
  static async getAll() {
    return await api.get("/investments");
  }

  static async create(data) {
    return await api.post("/investments", data);
  }

  static async remove(id) {
    return await api.delete(`/investments?id=${id}`);
  }

  static async updatePrices() {
    return await api.post("/investments/update-prices", {});
  }

  static async updateManualPrice(id, price) {
    return await api.patch(`/investments?id=${id}`, { current_price: price });
  }

  static async analyze() {
    return await api.post("/investments/analyze", {});
  }

  static async analyzeSingle(investmentId) {
    return await api.post("/investments/analyze-single", { investment_id: investmentId });
  }
}