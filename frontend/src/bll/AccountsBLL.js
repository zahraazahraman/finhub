import AccountsDAL from "../dal/AccountsDAL.js";
import { validators } from "../utils/validators.js";

export default class AccountsBLL {
  static async getAll() {
    const { ok, data } = await AccountsDAL.getAll();
    if (ok && data.success) return { success: true, accounts: data.accounts };
    return { success: false, error: data.message || "Failed to load accounts." };
  }

  static async create(formData) {
    const errors = {};
    errors.account_name = validators.required(formData.account_name, "Account name");
    errors.account_type = validators.required(formData.account_type, "Account type");
    errors.currency_id  = validators.required(formData.currency_id, "Currency");
    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await AccountsDAL.create(formData);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to create account." };
  }

  static async remove(id) {
    const { ok, data } = await AccountsDAL.remove(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete account." };
  }
}
