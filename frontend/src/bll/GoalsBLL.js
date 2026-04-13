import GoalsDAL from "../dal/GoalsDAL.js";
import { validators } from "../utils/validators.js";

export default class GoalsBLL {

  // ── Goals ──

  static async getAll() {
    const { ok, data } = await GoalsDAL.getAll();
    if (ok && data.success) return { success: true, goals: data.goals };
    return { success: false, error: data.message || "Failed to load goals." };
  }

  static async create(formData) {
    const errors = {};
    errors.goal_name     = validators.required(formData.goal_name, "Goal name");
    errors.goal_type     = validators.required(formData.goal_type, "Goal type");
    errors.target_amount = validators.required(formData.target_amount, "Target amount");

    if (!errors.target_amount) {
      errors.target_amount = validators.numeric(formData.target_amount, "Target amount");
    }
    if (!errors.target_amount && parseFloat(formData.target_amount) <= 0) {
      errors.target_amount = "Target amount must be greater than zero.";
    }

    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await GoalsDAL.create(formData);
    if (ok && data.success) return { success: true, goal_id: data.goal_id };
    return { success: false, error: data.message || "Failed to create goal." };
  }

  static async remove(id) {
    const { ok, data } = await GoalsDAL.remove(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete goal." };
  }

  // ── Contributions ──

  static async getContributions(goalId) {
    const { ok, data } = await GoalsDAL.getContributions(goalId);
    if (ok && data.success) return { success: true, contributions: data.contributions };
    return { success: false, error: data.message || "Failed to load contributions." };
  }

  static async addContribution(formData) {
    const errors = {};
    errors.account_id        = validators.required(formData.account_id, "Account");
    errors.amount            = validators.required(formData.amount, "Amount");
    errors.contribution_date = validators.required(formData.contribution_date, "Date");

    if (!errors.amount) {
      errors.amount = validators.numeric(formData.amount, "Amount");
    }
    if (!errors.amount && parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than zero.";
    }

    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    if (Object.keys(errors).length > 0) return { success: false, validationErrors: errors };

    const { ok, data } = await GoalsDAL.addContribution(formData);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to add contribution." };
  }

  static async removeContribution(id) {
    const { ok, data } = await GoalsDAL.removeContribution(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Failed to delete contribution." };
  }
}