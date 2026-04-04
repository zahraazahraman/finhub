import CurrenciesDAL from "../dal/CurrenciesDAL.js";

export default class CurrenciesBLL {
  static async getAll() {
    const { ok, data } = await CurrenciesDAL.getAll();
    if (ok && data.success) return { success: true, currencies: data.currencies };
    return { success: false, error: data.message || "Failed to load currencies." };
  }
}
