import AuthDAL from "../dal/AuthDAL.js";
import { validators } from "../utils/validators.js";

export default class AuthBLL {
  static validate(email, password) {
    const errors = {};
    errors.email = validators.required(email, "Email") ?? validators.email(email);
    errors.password = validators.required(password, "Password") 
      ?? validators.minLength(password, 6, "Password");
    // Remove null entries
    Object.keys(errors).forEach(k => errors[k] === null && delete errors[k]);
    return errors;
  }

  static async login(email, password) {
    const validationErrors = this.validate(email, password);
    if (Object.keys(validationErrors).length > 0)
      return { success: false, validationErrors };

    const { ok, data } = await AuthDAL.loginRequest(email, password);
    if (ok && data.success) return { success: true, user: data.user };
    return { success: false, serverError: data.message || "Invalid credentials." };
  }

  static async logout() {
    await AuthDAL.logoutRequest();
    return { success: true };
  }
}
