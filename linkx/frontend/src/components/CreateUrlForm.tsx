import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { CopyButton } from "./CopyButton";
import { urlApi } from "@/services/urlApi";
import { ApiClientError } from "@/services/api";
import type { ShortUrl } from "@/types";
import { formatDate } from "@/utils/format";

export function CreateUrlForm({ onCreated }: { onCreated?: (url: ShortUrl) => void }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [errors, setErrors] = useState<{ originalUrl?: string; customAlias?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ShortUrl | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setResult(null);

    if (!originalUrl.trim()) {
      setErrors({ originalUrl: "Enter a URL to shorten" });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await urlApi.createUrl(originalUrl.trim(), customAlias.trim() || undefined);
      setResult(created);
      setOriginalUrl("");
      setCustomAlias("");
      onCreated?.(created);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "VALIDATION_ERROR") {
          setErrors({ form: err.message });
        } else if (err.code === "CONFLICT" || err.code === "RESERVED_ALIAS") {
          setErrors({ customAlias: err.message });
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Long URL"
            name="originalUrl"
            placeholder="https://example.com/your/long/link"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            error={errors.originalUrl}
          />
        </div>
        <div className="sm:w-56">
          <Input
            label="Custom alias (optional)"
            name="customAlias"
            placeholder="my-link"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            error={errors.customAlias}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} className="sm:mb-[1px]">
          Shorten URL
        </Button>
      </form>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      {result && (
        <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-brand-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-medium text-brand-700 hover:underline"
            >
              {result.shortUrl}
            </a>
            <CopyButton value={result.shortUrl} />
          </div>
          <p className="truncate text-xs text-slate-500">{result.originalUrl}</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>{result.clickCount} clicks</span>
            <span>Created {formatDate(result.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
