import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/services/api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your links and analytics."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            Lx
          </div>
          <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
        <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
  );
}
