import InvestmentsDAL from "../dal/InvestmentsDAL.js";
import { validators } from "../utils/validators.js";

export default class InvestmentsBLL {

  static async getAll() {
    const { ok, data } = await InvestmentsDAL.getAll();
    if (ok && data.success) return { success: true, investments: data.investments };
    return { success: false, error: data.message || "Failed to load investments." };
  }

  static async create(formData) {
    const errors = {};

    errors.investment_name = validators.required(formData.investment_name, "Investment name");
    errors.investment_type = validators.required(formData.investment_type, "Investment type");
    errors.quantity        = validators.required(formData.quantity,        "Quantity");
    errors.purchase_price  = validators.required(formData.purchase_price,  "Purchase price");
    errors.currency_id     = validators.required(formData.currency_id,     "Currency");
    errors.purchase_date   = validators.required(formData.purchase_date,   "Purchase date");

    if (!errors.quantity) {
      errors.quantity = validators.numeric(formData.quantity, "Quantity");
    }
    if (!errors.quantity && parseFloat(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be greater than zero.";
    }

    if (!errors.purchase_price) {
      errors.purchase_price = validators.numeric(formData.purchase_price, "Purchase price");
    }
    if (!errors.purchase_price && parseFloat(formData.purchase_price) <= 0) {
      errors.purchase_price = "Purchase price must be greater than zero.";
    }

    if (formData.current_price !== "" && formData.current_price !== undefined) {
      errors.current_price = validators.numeric(formData.current_price, "Current price");
      if (!errors.current_price && parseFloat(formData.current_price) < 0) {
        errors.current_price = "Current price cannot be negative.";
      }
    }

    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await InvestmentsDAL.create(formData);
    if (ok && data.success) return { success: true, investment_id: data.investment_id };
    return { success: false, error: data.message || "Failed to add investment." };
  }

  static async remove(id) {
    const { ok, data } = await InvestmentsDAL.remove(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete investment." };
  }

  // Triggers auto price refresh (stock + crypto) via Finnhub/CoinGecko
  // Returns { success, updated: [{ investment_id, current_price }] }
  static async updatePrices() {
    const { ok, data } = await InvestmentsDAL.updatePrices();
    if (ok && data.success) return { success: true, updated: data.updated };
    return { success: false, error: data.message || "Failed to refresh prices." };
  }

  // Manual price update for real_estate / other
  static async updateManualPrice(id, price) {
    if (!price && price !== 0)
      return { success: false, validationErrors: { current_price: "Price is required." } };

    const parsed = parseFloat(price);
    if (isNaN(parsed))
      return { success: false, validationErrors: { current_price: "Price must be a valid number." } };
    if (parsed < 0)
      return { success: false, validationErrors: { current_price: "Price cannot be negative." } };

    const { ok, data } = await InvestmentsDAL.updateManualPrice(id, parsed);
    if (ok && data.success) return { success: true, current_price: data.current_price };
    return { success: false, error: data.message || "Failed to update price." };
  }

  static async analyze() {
    const { ok, data } = await InvestmentsDAL.analyze();
    if (ok && data.success) return { success: true, analysis: data.analysis };
    return { success: false, error: data.message || "AI analysis failed." };
  }
}