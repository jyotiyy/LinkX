import type { Context } from "hono";
import { UrlService } from "../services/url.service.js";
import { failure } from "../utils/apiResponse.js";
import { ApiError } from "../types/index.js";

export const RedirectController = {
  async handle(c: Context) {
    const code = c.req.param("shortCode");
    if (!code) {
      return failure(c, "NOT_FOUND", "Short URL not found", 404);
    }

    try {
      const originalUrl = await UrlService.resolveAndTrack(code, {
        ipAddress:
          c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
          c.req.header("x-real-ip") ??
          undefined,
        userAgent: c.req.header("user-agent") ?? undefined,
        referer: c.req.header("referer") ?? undefined,
      });

      return c.redirect(originalUrl, 302);
    } catch (err) {
      if (err instanceof ApiError) {
        return failure(c, err.code, err.message, err.status);
      }
      throw err;
    }
  },
};
