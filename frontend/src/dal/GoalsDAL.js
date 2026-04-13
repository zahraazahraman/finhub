import api from "../utils/api.js";

export default class GoalsDAL {
  static async getAll() {
    return await api.get("/goals");
  }

  static async create(data) {
    return await api.post("/goals", data);
  }

  static async remove(id) {
    return await api.delete(`/goals?id=${id}`);
  }

  static async getContributions(goalId) {
    return await api.get(`/goals/contributions?goal_id=${goalId}`);
  }

  static async addContribution(data) {
    return await api.post("/goals/contributions", data);
  }

  static async removeContribution(id) {
    return await api.delete(`/goals/contributions?contribution_id=${id}`);
  }
}