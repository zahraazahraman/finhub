import TransactionsDAL from "../dal/TransactionsDAL.js";
import { validators } from "../utils/validators.js";

export default class TransactionsBLL {
  static async getByAccount(accountId) {
    const { ok, data } = await TransactionsDAL.getByAccount(accountId);
    if (ok && data.success) return { success: true, transactions: data.transactions };
    return { success: false, error: data.message || "Failed to load transactions." };
  }

  static async create(formData) {
    const errors = {};
    errors.account_id        = validators.required(formData.account_id, "Account");
    errors.amount            = validators.required(formData.amount, "Amount")
      ?? validators.numeric(formData.amount, "Amount");
    errors.transaction_type  = validators.required(formData.transaction_type, "Transaction type");
    errors.transaction_date  = validators.required(formData.transaction_date, "Date");
    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await TransactionsDAL.create(formData);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to add transaction." };
  }

  static async remove(id) {
    const { ok, data } = await TransactionsDAL.remove(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete transaction." };
  }
}
