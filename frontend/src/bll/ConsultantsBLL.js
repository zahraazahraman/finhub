import ConsultantsDAL from "../dal/ConsultantsDAL.js";
import { validators } from "../utils/validators.js";

export default class ConsultantsBLL {
  static async getAll() {
    const { ok, data } = await ConsultantsDAL.getAll();
    if (ok) return { success: true, consultants: data };
    return { success: false, error: "Failed to load consultants." };
  }

  static async create(payload) {
    const firstNameError = validators.required(payload.first_name, "First name");
    if (firstNameError) return { success: false, error: firstNameError };
    const lastNameError = validators.required(payload.last_name, "Last name");
    if (lastNameError) return { success: false, error: lastNameError };
    const emailError = validators.required(payload.email, "Email") ?? validators.email(payload.email);
    if (emailError) return { success: false, error: emailError };

    const { ok, data } = await ConsultantsDAL.create(payload);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Create failed." };
  }

  static async update(id, payload) {
    const firstNameError = validators.required(payload.first_name, "First name");
    if (firstNameError) return { success: false, error: firstNameError };
    const lastNameError = validators.required(payload.last_name, "Last name");
    if (lastNameError) return { success: false, error: lastNameError };
    const emailError = validators.required(payload.email, "Email") ?? validators.email(payload.email);
    if (emailError) return { success: false, error: emailError };

    const { ok, data } = await ConsultantsDAL.update(id, payload);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Update failed." };
  }

  static async delete(id) {
    const { ok, data } = await ConsultantsDAL.delete(id);
    if (ok && data.success) return { success: true };
    return { success: false, error: data.message || "Delete failed." };
  }
}
