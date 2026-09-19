import { prisma } from "../config/prisma.js";
import { UrlService } from "./url.service.js";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export const AnalyticsService = {
  async getForUrl(userId: string, urlId: string) {
    const url = await UrlService.getOwnedByIdOrThrow(userId, urlId);

    const [totalClicks, latestClick, clicks] = await Promise.all([
      prisma.click.count({ where: { urlId } }),
      prisma.click.findFirst({ where: { urlId }, orderBy: { clickedAt: "desc" } }),
      prisma.click.findMany({
        where: { urlId },
        orderBy: { clickedAt: "asc" },
        select: { clickedAt: true, userAgent: true, referer: true },
      }),
    ]);

    // Aggregate clicks by calendar day for the "clicks over time" chart.
    const byDate = new Map<string, number>();
    const byReferrer = new Map<string, number>();
    const byUserAgent = new Map<string, number>();

    for (const click of clicks) {
      const dateKey = formatDate(click.clickedAt);
      byDate.set(dateKey, (byDate.get(dateKey) ?? 0) + 1);

      const referrerKey = click.referer ? new URL(safeUrl(click.referer)).hostname || click.referer : "Direct";
      byReferrer.set(referrerKey, (byReferrer.get(referrerKey) ?? 0) + 1);

      const uaKey = simplifyUserAgent(click.userAgent);
      byUserAgent.set(uaKey, (byUserAgent.get(uaKey) ?? 0) + 1);
    }

    const clicksByDate = Array.from(byDate.entries())
      .map(([date, count]) => ({ date, clicks: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const referrerSummary = Array.from(byReferrer.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);

    const userAgentSummary = Array.from(byUserAgent.entries())
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count);

    return {
      url,
      totalClicks,
      createdAt: url.createdAt,
      latestClickAt: latestClick?.clickedAt ?? null,
      clicksByDate,
      referrerSummary,
      userAgentSummary,
    };
  },
};

function safeUrl(value: string): string {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return value;
  } catch {
    return `https://${value.replace(/^https?:\/\//, "")}`;
  }
}

function simplifyUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}
