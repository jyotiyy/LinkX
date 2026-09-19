import type { Context } from "hono";
import { CreateUrlSchema, PaginationSchema } from "../validators/url.validator.js";
import { UrlService } from "../services/url.service.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { success, successNoContent } from "../utils/apiResponse.js";
import { getAuth } from "../middleware/auth.middleware.js";
import { ApiError } from "../types/index.js";

export const UrlController = {
  async create(c: Context) {
    const { userId } = getAuth(c);
    const body = CreateUrlSchema.parse(await c.req.json());
    const url = await UrlService.create(userId, body);
    return success(c, url, 201);
  },

  async list(c: Context) {
    const { userId } = getAuth(c);
    const query = PaginationSchema.parse(Object.fromEntries(new URL(c.req.url).searchParams));
    const result = await UrlService.listForUser(userId, query);
    return success(c, result);
  },

  async summary(c: Context) {
    const { userId } = getAuth(c);
    const result = await UrlService.getSummary(userId);
    return success(c, result);
  },

  async getOne(c: Context) {
    const { userId } = getAuth(c);
    const id = requireParam(c, "id");
    const url = await UrlService.getById(userId, id);
    return success(c, url);
  },

  async analytics(c: Context) {
    const { userId } = getAuth(c);
    const id = requireParam(c, "id");
    const data = await AnalyticsService.getForUrl(userId, id);
    return success(c, data);
  },

  async remove(c: Context) {
    const { userId } = getAuth(c);
    const id = requireParam(c, "id");
    await UrlService.delete(userId, id);
    return successNoContent(c);
  },
};

function requireParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) {
    throw new ApiError("VALIDATION_ERROR", `Missing required URL parameter: ${name}`, 400);
  }
  return value;
}
