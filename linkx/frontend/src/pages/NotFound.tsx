import { Link } from "react-router-dom";
import { Button } from "@/components/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold text-brand-500">404</p>
      <h1 className="text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The short link or page you&apos;re looking for doesn&apos;t exist or may have expired.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
