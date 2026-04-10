import api from "../utils/api.js";

export default class UserDashboardDAL {
    static async getSummary(params = {}) {
        const query = new URLSearchParams();

        if (params.from)         query.set('from',          params.from);
        if (params.to)           query.set('to',            params.to);
        if (params.categoryType) query.set('category_type', params.categoryType);
        if (params.categoryId)   query.set('category_id',   params.categoryId);

        const qs = query.toString();
        return await api.get(`/user-dashboard${qs ? '?' + qs : ''}`);
    }
}