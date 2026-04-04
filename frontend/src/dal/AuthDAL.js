import api from "../utils/api.js";

export default class AuthDAL {
  static async loginRequest(email, password) {
    return await api.post("/auth/login", { email, password });
  }

  static async logoutRequest() {
    return await api.post("/auth/logout", {});
  }
}
