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

  // Triggers Finnhub/CoinGecko fetch on the backend for all stock/crypto
  static async updatePrices() {
    return await api.post("/investments/update-prices", {});
  }

  // Manual price update for real_estate / other
  static async updateManualPrice(id, price) {
    return await api.patch(`/investments?id=${id}`, { current_price: price });
  }

  static async analyze() {
    return await api.post("/investments/analyze", {});
  }
}