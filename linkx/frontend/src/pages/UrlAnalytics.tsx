import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { CopyButton } from "@/components/CopyButton";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { analyticsApi } from "@/services/analyticsApi";
import { ApiClientError } from "@/services/api";
import type { UrlAnalytics } from "@/types";
import { formatDate, formatDateTime } from "@/utils/format";

export function UrlAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UrlAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    analyticsApi
      .getAnalytics(id)
      .then(setData)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load analytics"))
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/urls" className="text-sm text-slate-500 hover:text-ink-900">
            ← Back to My Links
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink-900">Link Analytics</h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="p-5">
          <EmptyState title="Couldn't load analytics" description={error} />
        </Card>
      )}

      {!isLoading && data && (
        <>
          <Card className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <a
                  href={data.url.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm font-medium text-brand-600 hover:underline"
                >
                  {data.url.shortUrl}
                </a>
                <p className="mt-1 truncate text-sm text-slate-500">{data.url.originalUrl}</p>
              </div>
              <CopyButton value={data.url.shortUrl} />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Clicks" value={data.totalClicks} />
            <StatCard label="Created" value={formatDate(data.createdAt)} />
            <StatCard
              label="Last Click"
              value={data.latestClickAt ? formatDateTime(data.latestClickAt) : "No clicks yet"}
            />
          </div>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Clicks over time</h2>
            {data.clicksByDate.length === 0 ? (
              <EmptyState title="No clicks yet" description="Share your short link to start seeing data here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.clicksByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" fontSize={12} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#0a4bef" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Referrers</h2>
              {data.referrerSummary.length === 0 ? (
                <p className="text-sm text-slate-400">No referrer data yet.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {data.referrerSummary.map((r) => (
                    <li key={r.referrer} className="flex items-center justify-between">
                      <span className="text-slate-600">{r.referrer}</span>
                      <span className="font-medium text-ink-900">{r.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Browsers</h2>
              {data.userAgentSummary.length === 0 ? (
                <p className="text-sm text-slate-400">No browser data yet.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {data.userAgentSummary.map((r) => (
                    <li key={r.userAgent} className="flex items-center justify-between">
                      <span className="text-slate-600">{r.userAgent}</span>
                      <span className="font-medium text-ink-900">{r.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
