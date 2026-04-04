import api from "../utils/api.js";

export default class UserNotificationsDAL {
  static async getAll() {
    return await api.get("/user-notifications");
  }

  static async delete(id) {
    return await api.delete(`/user-notifications/${id}`);
  }
}
