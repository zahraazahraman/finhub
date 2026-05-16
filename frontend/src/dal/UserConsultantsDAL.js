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

  static async getOne(id) {
    return await api.get(`/user-consultants?action=getOne&id=${id}`);
  }

  static async matchByNeed(need) {
    return await api.get(`/user-consultants?action=matchByNeed&need=${encodeURIComponent(need)}`);
  }

  static async checkEligibility(consultantId) {
    return await api.get(`/user-consultants/inquiries?action=checkEligibility&consultant_id=${consultantId}`);
  }

  static async getMyInquiries() {
    return await api.get("/user-consultants/inquiries");
  }

  static async generateBrief(consultantId, userNote = "", includeData = true) {
    return await api.post("/user-consultants/brief", {
      consultant_id: consultantId,
      user_note:     userNote,
      include_data:  includeData,
    });
  }

  static async submitInquiry(consultantId, brief, note, situationTag) {
    return await api.post("/user-consultants/inquiries", {
      consultant_id: consultantId,
      brief_text:    brief,
      user_note:     note,
      situation_tag: situationTag,
    });
  }
}