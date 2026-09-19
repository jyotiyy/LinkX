import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/services/api";
import { AuthShell } from "./Login";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start shortening links and tracking clicks in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
