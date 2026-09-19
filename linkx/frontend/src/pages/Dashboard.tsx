import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { CreateUrlForm } from "@/components/CreateUrlForm";
import { UrlTable } from "@/components/UrlTable";
import { Spinner } from "@/components/Spinner";
import { urlApi } from "@/services/urlApi";
import type { DashboardSummary } from "@/types";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await urlApi.getSummary();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  async function handleDelete(id: string) {
    await urlApi.deleteUrl(id);
    loadSummary();
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          An overview of your short links and their performance.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-900">Create a short link</h2>
        <CreateUrlForm onCreated={loadSummary} />
      </Card>

      {isLoading && !summary ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Links" value={summary.totalLinks} />
            <StatCard label="Total Clicks" value={summary.totalClicks} />
            <StatCard
              label="Top Performing Link"
              value={
                summary.topLink
                  ? (summary.topLink.customAlias ?? summary.topLink.shortCode)
                  : "—"
              }
              hint={summary.topLink ? `${summary.topLink.clickCount} clicks` : "No links yet"}
            />
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Recent links</h2>
            </div>
            <UrlTable
              urls={summary.recentLinks}
              onDelete={(url) => handleDelete(url.id)}
            />
          </Card>
        </>
      ) : null}
    </DashboardLayout>
  );
}
