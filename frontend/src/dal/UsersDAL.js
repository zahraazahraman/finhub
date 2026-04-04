import api from "../utils/api.js";

export default class UsersDAL {
  static async getAll() {
    return await api.get("/users");
  }

  static async updateStatus(userId, status) {
    return await api.patch(`/users/${userId}/status`, { status });
  }

  static async delete(userId) {
    return await api.delete(`/users/${userId}`);
  }
}
