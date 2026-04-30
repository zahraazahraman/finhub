import api from "../utils/api.js";

export default class UserConsultantsDAL {
  static async getAll(specialization = null) {
    const query =
      specialization && specialization !== "all"
        ? `/user-consultants?specialization=${encodeURIComponent(specialization)}`
        : "/user-consultants";
    return await api.get(query);
  }

  static async getSpecializations() {
    return await api.get("/user-consultants?action=specializations");
  }
}