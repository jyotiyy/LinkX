import { useState } from "react";
import { Link } from "react-router-dom";
import type { ShortUrl } from "@/types";
import { CopyButton } from "./CopyButton";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Spinner } from "./Spinner";
import { formatDate, truncate } from "@/utils/format";

export function UrlTable({
  urls,
  isLoading,
  onDelete,
}: {
  urls: ShortUrl[];
  isLoading?: boolean;
  onDelete: (url: ShortUrl) => Promise<void> | void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(url: ShortUrl) {
    if (!window.confirm(`Delete ${url.shortUrl}? This cannot be undone.`)) return;
    setDeletingId(url.id);
    try {
      await onDelete(url);
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <EmptyState
        title="No links yet"
        description="Create your first short link above to see it appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] table-auto text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-3 pr-4 font-medium">Short URL</th>
            <th className="py-3 pr-4 font-medium">Original URL</th>
            <th className="py-3 pr-4 font-medium">Clicks</th>
            <th className="py-3 pr-4 font-medium">Created</th>
            <th className="py-3 pl-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {urls.map((url) => (
            <tr key={url.id} className="align-middle">
              <td className="py-3 pr-4">
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-brand-600 hover:underline"
                >
                  {url.customAlias ?? url.shortCode}
                </a>
              </td>
              <td className="py-3 pr-4 text-slate-600">
                <span title={url.originalUrl}>{truncate(url.originalUrl)}</span>
              </td>
              <td className="py-3 pr-4 font-medium text-ink-900">{url.clickCount}</td>
              <td className="py-3 pr-4 text-slate-500">{formatDate(url.createdAt)}</td>
              <td className="py-3 pl-4">
                <div className="flex justify-end gap-2">
                  <Link to={`/analytics/${url.id}`}>
                    <Button variant="ghost" size="sm">
                      Analytics
                    </Button>
                  </Link>
                  <CopyButton value={url.shortUrl} />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(url)}
                    isLoading={deletingId === url.id}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
