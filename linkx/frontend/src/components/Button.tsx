import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/format";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  isLoading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300",
  secondary: "bg-white text-ink-900 border border-slate-200 hover:bg-slate-50",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
  ghost: "bg-transparent text-ink-700 hover:bg-slate-100",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-70",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
