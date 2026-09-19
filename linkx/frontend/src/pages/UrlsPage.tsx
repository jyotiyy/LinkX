import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { UrlTable } from "@/components/UrlTable";
import { urlApi } from "@/services/urlApi";
import type { ShortUrl, PaginationMeta } from "@/types";

const LIMIT = 8;

export function UrlsPage() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await urlApi.getUrls({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setUrls(data.urls);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  async function handleDelete(url: ShortUrl) {
    await urlApi.deleteUrl(url.id);
    loadUrls();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink-900">My Links</h1>
        <p className="text-sm text-slate-500">All the short links you&apos;ve created.</p>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:w-80">
            <Input
              placeholder="Search by URL or alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search links"
            />
          </div>
          {pagination && (
            <p className="text-xs text-slate-400">
              {pagination.total} link{pagination.total === 1 ? "" : "s"} total
            </p>
          )}
        </div>

        <UrlTable urls={urls} isLoading={isLoading} onDelete={handleDelete} />

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
