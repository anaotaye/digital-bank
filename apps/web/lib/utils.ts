import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's standard classname merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Nigerian Naira with thousands separators */
export function formatNaira(
  amount: number,
  options?: { compact?: boolean },
): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: options?.compact ? 0 : 2,
    maximumFractionDigits: options?.compact ? 0 : 2,
  }).format(amount);
  return `₦${formatted}`;
}

/**
 * Mask a BVN/NIN so it displays as •••••••4455 (last 4 digits visible).
 * Sensitive identity numbers shouldn't appear in full on any screen the
 * customer might screenshot or share.
 */
export function maskId(value: string): string {
  if (value.length < 4) return "•".repeat(value.length);
  return "•".repeat(value.length - 4) + value.slice(-4);
}

/** Turn "Ada Lovelace" into "AL" for avatar circles */
export function initials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

/** e.g. "just now" / "2 hrs ago" / "yesterday" / "3 days ago" */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}
