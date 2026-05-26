import ChatDAL from "../dal/ChatsDAL.js";

export default class ChatBLL {
  static async getSession() {
    const { ok, data } = await ChatDAL.getSession();
    if (ok && data.success)
      return { success: true, sessionId: data.session_id, messages: data.messages };
    return { success: false, error: data.message || "Failed to load chat session." };
  }

  static async sendMessage(sessionId, message) {
    const trimmed = message?.trim() ?? "";
    if (!trimmed)
      return { success: false, error: "Message cannot be empty." };
    if (trimmed.length > 2000)
      return { success: false, error: "Message is too long (max 2000 characters)." };

    const { ok, data } = await ChatDAL.sendMessage(sessionId, trimmed);
    if (ok && data.success) return { success: true, message: data.message };
    return { success: false, error: data.message || "Failed to send message." };
  }

  static async newSession() {
    const { ok, data } = await ChatDAL.newSession();
    if (ok && data.success)
      return { success: true, sessionId: data.session_id, messages: data.messages };
    return { success: false, error: data.message || "Failed to start a new chat." };
  }

  static async getHistory() {
    const { ok, data } = await ChatDAL.getHistory();
    if (ok && data.success) return { success: true, sessions: data.sessions };
    return { success: false, error: data.message || "Failed to load history." };
  }

  static async getSessionMessages(sessionId) {
    const { ok, data } = await ChatDAL.getSessionMessages(sessionId);
    if (ok && data.success)
      return { success: true, session: data.session, messages: data.messages };
    return { success: false, error: data.message || "Failed to load session." };
  }

  static async resumeSession(sessionId) {
    const { ok, data } = await ChatDAL.resumeSession(sessionId);
    if (ok && data.success)
      return { success: true, sessionId: data.session_id, messages: data.messages };
    return { success: false, error: data.message || "Failed to resume session." };
  }
}