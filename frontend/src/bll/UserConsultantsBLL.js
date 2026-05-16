import UserConsultantsDAL from "../dal/UserConsultantsDAL.js";

export default class UserConsultantsBLL {
  static async getAll(specialization = null) {
    const { ok, data } = await UserConsultantsDAL.getAll(specialization);
    if (ok && data.success) return { success: true, consultants: data.consultants };
    return { success: false, error: data.message || "Failed to load consultants." };
  }

  static async getSpecializations() {
    const { ok, data } = await UserConsultantsDAL.getSpecializations();
    if (ok && data.success) return { success: true, specializations: data.specializations };
    return { success: false, error: data.message || "Failed to load specializations." };
  }

  static async getOne(id) {
    const { ok, data } = await UserConsultantsDAL.getOne(id);
    if (ok && data.success) return { success: true, consultant: data.consultant };
    return { success: false, error: data.message || "Failed to load consultant profile." };
  }

  static async matchByNeed(need) {
    const { ok, data } = await UserConsultantsDAL.matchByNeed(need);
    if (ok && data.success)
      return { success: true, consultants: data.consultants, matchedSpec: data.matched_spec };
    return { success: false, error: data.message || "Failed to match consultants." };
  }

  static async checkEligibility(consultantId) {
    const { ok, data } = await UserConsultantsDAL.checkEligibility(consultantId);
    if (ok && data.success)
      return { success: true, alreadySent: data.already_sent, canReview: data.can_review, inquiryId: data.inquiry_id };
    return { success: false, error: data.message || "Failed to check eligibility." };
  }

  static async generateBrief(consultantId, userNote = "", includeData = true) {
    const { ok, data } = await UserConsultantsDAL.generateBrief(consultantId, userNote, includeData);
    if (ok && data.success) return { success: true, briefText: data.brief_text };
    return { success: false, error: data.message || "Failed to generate brief." };
  }

  static async submitInquiry(consultantId, brief, note, situationTag) {
    const { ok, data } = await UserConsultantsDAL.submitInquiry(consultantId, brief, note, situationTag);
    if (ok && data.success) return { success: true, inquiryId: data.inquiry_id };
    return { success: false, error: data.message || "Failed to submit inquiry." };
  }

  static async getMyInquiries() {
    const { ok, data } = await UserConsultantsDAL.getMyInquiries();
    if (ok && data.success) return { success: true, inquiries: data.inquiries };
    return { success: false, inquiries: [] };
  }
}