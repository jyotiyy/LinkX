import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/utils/format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-800">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
            error ? "border-red-300" : "border-slate-200",
            className
          )}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
