import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../types/index.js";
import { generateUniqueShortCode, RESERVED_ALIASES } from "../utils/shortCode.js";
import type { CreateUrlInput, PaginationInput } from "../validators/url.validator.js";

function toPublicUrl(url: {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clickCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const code = url.customAlias ?? url.shortCode;
  return {
    id: url.id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    customAlias: url.customAlias,
    shortUrl: `${env.shortUrlBase}/${code}`,
    clickCount: url.clickCount,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt,
  };
}

export const UrlService = {
  async create(userId: string, input: CreateUrlInput) {
    let shortCode: string;
    let customAlias: string | undefined;

    if (input.customAlias) {
      const alias = input.customAlias.toLowerCase();

      if (RESERVED_ALIASES.has(alias)) {
        throw new ApiError("RESERVED_ALIAS", `"${input.customAlias}" is a reserved word and cannot be used as an alias`, 409);
      }

      const existing = await prisma.url.findFirst({
        where: { OR: [{ customAlias: input.customAlias }, { shortCode: input.customAlias }] },
      });
      if (existing) {
        throw new ApiError("CONFLICT", "This custom alias is already taken", 409);
      }

      customAlias = input.customAlias;
      shortCode = await generateUniqueShortCode();
    } else {
      shortCode = await generateUniqueShortCode();
    }

    const url = await prisma.url.create({
      data: {
        originalUrl: input.originalUrl,
        shortCode,
        customAlias: customAlias ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        userId,
      },
    });

    return toPublicUrl(url);
  },

  async listForUser(userId: string, pagination: PaginationInput) {
    const { page, limit, search, sortBy, sortOrder } = pagination;

    const where = {
      userId,
      ...(search
        ? {
            OR: [
              { originalUrl: { contains: search, mode: "insensitive" as const } },
              { shortCode: { contains: search, mode: "insensitive" as const } },
              { customAlias: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, urls] = await Promise.all([
      prisma.url.count({ where }),
      prisma.url.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      urls: urls.map(toPublicUrl),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async getSummary(userId: string) {
    const [totalLinks, aggregate, topUrl, recentUrls] = await Promise.all([
      prisma.url.count({ where: { userId } }),
      prisma.url.aggregate({ where: { userId }, _sum: { clickCount: true } }),
      prisma.url.findFirst({ where: { userId }, orderBy: { clickCount: "desc" } }),
      prisma.url.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    return {
      totalLinks,
      totalClicks: aggregate._sum.clickCount ?? 0,
      topLink: topUrl ? toPublicUrl(topUrl) : null,
      recentLinks: recentUrls.map(toPublicUrl),
    };
  },

  async getOwnedByIdOrThrow(userId: string, urlId: string) {
    const url = await prisma.url.findUnique({ where: { id: urlId } });
    if (!url) {
      throw new ApiError("NOT_FOUND", "URL not found", 404);
    }
    if (url.userId !== userId) {
      throw new ApiError("FORBIDDEN", "You do not have access to this URL", 403);
    }
    return url;
  },

  async getById(userId: string, urlId: string) {
    const url = await this.getOwnedByIdOrThrow(userId, urlId);
    return toPublicUrl(url);
  },

  async delete(userId: string, urlId: string) {
    await this.getOwnedByIdOrThrow(userId, urlId);
    // onDelete: Cascade in the schema removes associated Click rows.
    await prisma.url.delete({ where: { id: urlId } });
  },

  /**
   * Resolves a short code (or custom alias) to its target URL, recording a
   * Click and incrementing clickCount atomically in a single transaction so
   * concurrent redirects never leave the two out of sync.
   */
  async resolveAndTrack(
    code: string,
    meta: { ipAddress?: string; userAgent?: string; referer?: string }
  ) {
    const url = await prisma.url.findFirst({
      where: { OR: [{ shortCode: code }, { customAlias: code }] },
    });

    if (!url) {
      throw new ApiError("NOT_FOUND", "Short URL not found", 404);
    }

    if (url.expiresAt && url.expiresAt.getTime() < Date.now()) {
      throw new ApiError("EXPIRED", "This short URL has expired", 410);
    }

    await prisma.$transaction([
      prisma.click.create({
        data: {
          urlId: url.id,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          referer: meta.referer,
        },
      }),
      prisma.url.update({
        where: { id: url.id },
        data: { clickCount: { increment: 1 } },
      }),
    ]);

    return url.originalUrl;
  },
};
