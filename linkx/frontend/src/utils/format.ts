export function cn(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(value: string, max = 48): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
