import AuthDAL from "../dal/AuthDAL.js";

export default class AuthBLL {
  static validate(email, password) {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    return errors;
  }

  static async login(email, password) {
    const validationErrors = this.validate(email, password);
    if (Object.keys(validationErrors).length > 0)
      return { success: false, validationErrors };
    try {
      const { ok, data } = await AuthDAL.loginRequest(email, password);
      if (ok && data.success) return { success: true, user: data.user };
      return { success: false, serverError: data.message || "Invalid credentials." };
    } catch {
      return { success: false, serverError: "Network error. Please try again." };
    }
  }

  static async logout() {
    try {
      await AuthDAL.logoutRequest();
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}