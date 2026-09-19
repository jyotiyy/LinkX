import { api, toApiError } from "./api";
import type { ShortUrl, UrlListResponse, DashboardSummary } from "@/types";

export interface ListUrlsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "clickCount";
  sortOrder?: "asc" | "desc";
}

export const urlApi = {
  async createUrl(originalUrl: string, customAlias?: string): Promise<ShortUrl> {
    try {
      const res = await api.post("/api/urls", {
        originalUrl,
        ...(customAlias ? { customAlias } : {}),
      });
      return res.data.data as ShortUrl;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async getUrls(params: ListUrlsParams = {}): Promise<UrlListResponse> {
    try {
      const res = await api.get("/api/urls", { params });
      return res.data.data as UrlListResponse;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async getSummary(): Promise<DashboardSummary> {
    try {
      const res = await api.get("/api/urls/summary");
      return res.data.data as DashboardSummary;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async getUrl(id: string): Promise<ShortUrl> {
    try {
      const res = await api.get(`/api/urls/${id}`);
      return res.data.data as ShortUrl;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async deleteUrl(id: string): Promise<void> {
    try {
      await api.delete(`/api/urls/${id}`);
    } catch (err) {
      throw toApiError(err);
    }
  },
};
