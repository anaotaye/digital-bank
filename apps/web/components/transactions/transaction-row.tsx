"use client";

import Link from "next/link";
import { Clock, X } from "lucide-react";
import { cn, formatNaira, relativeTime } from "@/lib/utils";

export type Transaction = {
  id: string;
  nibssTransactionId?: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  from: string;
  to: string;
  recipientName?: string | null;
  recipientBankCode?: string | null;
  initiatedAt: string;
  completedAt?: string | null;
};

const AVATAR_COLORS = [
  "bg-primary-soft text-primary",
  "bg-success-soft text-success",
  "bg-shell text-gold",
  "bg-ink-100 text-ink-700",
] as const;

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Identity avatar (deterministic color + initial) with a corner status badge
 * for anything that isn't a clean SUCCESS. Success is the norm here — marking
 * every row would just be noise — so only FAILED / PENDING get a badge.
 * The badge is decorative; the "Failed · " / "Pending · " sublabel is the a11y signal.
 */
export function TransactionAvatar({
  seed,
  initial,
  status,
  size = "sm",
  ringClass = "ring-cream",
}: {
  seed: string;
  initial: string;
  status: Transaction["status"];
  size?: "sm" | "md";
  ringClass?: string;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-serif font-medium",
          size === "md" ? "h-12 w-12 text-lg" : "h-10 w-10 text-base",
          avatarColor(seed),
        )}
        style={{ fontVariationSettings: "'SOFT' 100" }}
      >
        {initial}
      </div>
      {status !== "SUCCESS" && (
        <span
          aria-hidden
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex h-3.75 w-3.75 items-center justify-center rounded-full text-cream ring-2",
            ringClass,
            status === "FAILED"
              ? "bg-danger"
              : "bg-gold motion-safe:animate-pulse",
          )}
        >
          {status === "FAILED" ? (
            <X className="h-2 w-2" strokeWidth={3.5} />
          ) : (
            <Clock className="h-2 w-2" strokeWidth={2.75} />
          )}
        </span>
      )}
    </div>
  );
}

export function TransactionRow({
  tx,
  linkTo,
}: {
  tx: Transaction;
  linkTo?: string;
}) {
  const label = tx.recipientName
    ? tx.recipientName
    : `${tx.to.slice(0, 4)}···${tx.to.slice(-3)}`;
  const initial = (
    tx.recipientName?.slice(0, 1) ?? tx.to.slice(0, 1)
  ).toUpperCase();

  const isFailed = tx.status === "FAILED";
  const isPending = tx.status === "PENDING";
  const timestamp = tx.completedAt ?? tx.initiatedAt;

  const body = (
    <div className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-shell/50">
      <TransactionAvatar
        seed={tx.recipientName ?? tx.to}
        initial={initial}
        status={tx.status}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-sans text-sm font-medium text-ink-900">
          Sent to {label}
        </div>
        <div className="font-sans text-[11px] text-ink-500">
          {isPending && "Pending · "}
          {isFailed && "Failed · "}
          {relativeTime(timestamp)}
        </div>
      </div>
      <div
        className={cn(
          "shrink-0 font-serif text-[15px] font-medium tracking-tight",
          isFailed ? "text-ink-400 line-through" : "text-ink-900",
        )}
        style={{ fontVariationSettings: "'SOFT' 100" }}
      >
        {formatNaira(tx.amount, { compact: true })}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{body}</Link>;
  }
  return body;
}
