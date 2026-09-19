import { api, toApiError } from "./api";
import type { UrlAnalytics } from "@/types";

export const analyticsApi = {
  async getAnalytics(urlId: string): Promise<UrlAnalytics> {
    try {
      const res = await api.get(`/api/urls/${urlId}/analytics`);
      return res.data.data as UrlAnalytics;
    } catch (err) {
      throw toApiError(err);
    }
  },
};
