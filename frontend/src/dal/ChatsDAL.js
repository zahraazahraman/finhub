import api from "../utils/api.js";

export default class ChatsDAL {
  static async getSession() {
    return await api.get("/chat");
  }

  static async sendMessage(sessionId, message) {
    return await api.post("/chat", { session_id: sessionId, message });
  }

  static async newSession() {
    return await api.delete("/chat");
  }

  static async getHistory() {
    return await api.get("/chat/history");
  }

  static async getSessionMessages(sessionId) {
    return await api.get(`/chat/history?session_id=${sessionId}`);
  }

  static async resumeSession(sessionId) {
    return await api.post("/chat/history", { session_id: sessionId });
  }
}