import api from "../utils/api.js";

export default class BillsDAL {
  // ── Bills ──
  static async getAll()        { return await api.get("/bills"); }
  static async create(data)    { return await api.post("/bills", data); }
  static async update(id, data){ return await api.patch(`/bills?id=${id}`, { ...data, action: "update_bill" }); }
  static async markPaid(id)    { return await api.patch(`/bills?id=${id}`, { action: "mark_paid" }); }
  static async markUnpaid(id)  { return await api.patch(`/bills?id=${id}`, { action: "mark_unpaid" }); }
  static async remove(id)      { return await api.delete(`/bills?id=${id}`); }

  // ── Reminders ──
  static async getReminders(billId)  { return await api.get(`/reminders?bill_id=${billId}`); }
  static async addReminder(data)     { return await api.post("/reminders", data); }
  static async removeReminder(id)    { return await api.delete(`/reminders?id=${id}`); }

  // ── Email ──
  static async sendDue()           { return await api.post("/reminders/send-due", {}); }
  static async sendWeeklySummary() { return await api.post("/reminders/weekly-summary", {}); }

  // ── Categories (expense type for bill form) ──
  static async getCategories() { return await api.get("/bills?action=categories"); }
}