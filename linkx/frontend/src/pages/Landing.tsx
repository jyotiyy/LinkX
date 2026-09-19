import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { CopyButton } from "@/components/CopyButton";
import { useAuth } from "@/hooks/useAuth";
import { urlApi } from "@/services/urlApi";
import { ApiClientError } from "@/services/api";
import type { ShortUrl } from "@/types";

const features = [
  {
    title: "Custom aliases",
    description: "Pick a memorable slug for every link instead of a random string.",
  },
  {
    title: "Fast redirects",
    description: "Short links resolve in milliseconds with a single database lookup.",
  },
  {
    title: "Click tracking",
    description: "Every click is recorded with timestamp, referrer, and device info.",
  },
  {
    title: "Analytics",
    description: "See clicks over time and where your traffic is coming from.",
  },
  {
    title: "Secure authentication",
    description: "JWT-based auth with bcrypt password hashing keeps accounts safe.",
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ShortUrl | null>(null);

  async function handleShorten(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!originalUrl.trim()) {
      setError("Enter a URL to shorten");
      return;
    }

    if (!isAuthenticated) {
      // Anonymous visitors are sent to register so their links are saved
      // to an account rather than being created without an owner.
      navigate("/register");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await urlApi.createUrl(originalUrl.trim());
      setResult(created);
      setOriginalUrl("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            Lx
          </div>
          <span className="text-lg font-semibold text-ink-900">LinkX</span>
        </div>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-ink-900">
                Log in
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Short links. Track clicks. Share smarter.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
          LinkX turns long, unwieldy URLs into clean short links — and shows you exactly who
          clicked, when, and from where.
        </p>

        <form
          onSubmit={handleShorten}
          className="mx-auto mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
        >
          <div className="flex-1 text-left">
            <Input
              aria-label="Long URL"
              placeholder="Paste a long URL to shorten it"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="border-0 focus:ring-0"
            />
          </div>
          <Button type="submit" isLoading={isSubmitting} className="sm:px-6">
            Shorten URL
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mx-auto mt-4 flex max-w-xl items-center justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4 text-left">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate font-mono text-sm font-medium text-brand-700 hover:underline"
            >
              {result.shortUrl}
            </a>
            <CopyButton value={result.shortUrl} />
          </div>
        )}

        {!isAuthenticated && (
          <p className="mt-3 text-xs text-slate-400">
            Sign up to save your links, track clicks, and view analytics.
          </p>
        )}
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-ink-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        Built with Hono, Prisma, PostgreSQL, and React.
      </footer>
    </div>
  );
}
