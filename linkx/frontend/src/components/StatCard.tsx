import type { ReactNode } from "react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
