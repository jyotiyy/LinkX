import type { HTMLAttributes } from "react";
import { cn } from "@/utils/format";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
