import BillsDAL from "../dal/BillsDAL.js";
import { validators } from "../utils/validators.js";

export default class BillsBLL {

  // ── Bills ──

  static async getAll() {
    const { ok, data } = await BillsDAL.getAll();
    if (ok && data.success) return { success: true, bills: data.bills };
    return { success: false, error: data.message || "Failed to load bills." };
  }

  static async create(formData) {
    const errors = {};
    errors.name        = validators.required(formData.name,        "Bill name");
    errors.amount      = validators.required(formData.amount,      "Amount");
    errors.currency_id = validators.required(formData.currency_id, "Currency");
    errors.due_date    = validators.required(formData.due_date,    "Due date");

    if (!errors.amount) errors.amount = validators.numeric(formData.amount, "Amount");
    if (!errors.amount && parseFloat(formData.amount) <= 0)
      errors.amount = "Amount must be greater than zero.";

    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await BillsDAL.create(formData);
    if (ok && data.success) return { success: true, bill: data.bill };
    return { success: false, error: data.message || "Failed to create bill." };
  }

  static async update(id, formData) {
    const errors = {};
    errors.name        = validators.required(formData.name,        "Bill name");
    errors.amount      = validators.required(formData.amount,      "Amount");
    errors.currency_id = validators.required(formData.currency_id, "Currency");
    errors.due_date    = validators.required(formData.due_date,    "Due date");

    if (!errors.amount) errors.amount = validators.numeric(formData.amount, "Amount");
    if (!errors.amount && parseFloat(formData.amount) <= 0)
      errors.amount = "Amount must be greater than zero.";

    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await BillsDAL.update(id, formData);
    if (ok && data.success) return { success: true, bill: data.bill };
    return { success: false, error: data.message || "Failed to update bill." };
  }

  static async markPaid(id) {
    const { ok, data } = await BillsDAL.markPaid(id);
    if (ok && data.success) return { success: true, next_bill: data.next_bill };
    return { success: false, error: data.message || "Failed to mark bill as paid." };
  }

  static async markUnpaid(id) {
    const { ok, data } = await BillsDAL.markUnpaid(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to update bill." };
  }

  static async remove(id) {
    const { ok, data } = await BillsDAL.remove(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete bill." };
  }

  // ── Reminders ──

  static async getReminders(billId) {
    const { ok, data } = await BillsDAL.getReminders(billId);
    if (ok && data.success) return { success: true, reminders: data.reminders };
    return { success: false, error: data.message || "Failed to load reminders." };
  }

  static async addReminder(formData) {
    const errors = {};
    errors.days_before = validators.required(formData.days_before, "Days before");
    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await BillsDAL.addReminder(formData);
    if (ok && data.success) return { success: true, reminder: data.reminder };
    return { success: false, error: data.message || "Failed to add reminder." };
  }

  static async removeReminder(id) {
    const { ok, data } = await BillsDAL.removeReminder(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete reminder." };
  }

  // ── Email ──

  static async sendDue() {
    const { ok, data } = await BillsDAL.sendDue();
    if (ok && data.success) return { success: true, sent: data.sent };
    return { success: false };
  }

  static async sendWeeklySummary() {
    const { ok, data } = await BillsDAL.sendWeeklySummary();
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to send weekly summary." };
  }

  // ── Categories ──

  static async getExpenseCategories() {
    const { ok, data } = await BillsDAL.getCategories();
    if (!ok) return { success: false, error: "Failed to load categories." };
    const all        = data.categories || [];
    const categories = all.filter(c => c.type === "expense");
    return { success: true, categories };
  }
}