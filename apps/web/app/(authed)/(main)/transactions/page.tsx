"use client";

import { useState } from "react";
import useSWRInfinite from "swr/infinite";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TransactionRow,
  type Transaction,
} from "@/components/transactions/transaction-row";

type Filter = "all" | "SUCCESS" | "FAILED" | "PENDING";

type Page = {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const PAGE_SIZE = 20;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "SUCCESS", label: "Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const getKey = (pageIndex: number, previousPageData: Page | null) => {
    // Stop when the previous page came back empty.
    if (previousPageData && previousPageData.transactions.length === 0)
      return null;
    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(PAGE_SIZE),
    });
    if (filter !== "all") params.set("status", filter);
    return `/api/transactions?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<Page>(getKey);

  const pages = data ?? [];
  const transactions = pages.flatMap((p) => p.transactions);
  const total = pages[0]?.pagination.total ?? 0;
  const hasMore = transactions.length < total;
  const isLoadingMore = isValidating && size > pages.length;

  const grouped = groupByDay(transactions);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-serif text-[26px] font-medium tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Activity
        </h1>
        <p className="mt-1 font-sans text-sm text-ink-500">
          Everything you&apos;ve sent, in order.
        </p>
      </div>

      {/* Filter chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                setSize(1);
                mutate();
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 font-sans text-[13px] font-medium transition-colors",
                active
                  ? "border-ink-900 bg-ink-900 text-cream"
                  : "border-ink-200 bg-paper text-ink-700 hover:border-ink-300",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading && pages.length === 0 ? (
        <SkeletonList />
      ) : transactions.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ label, items }) => (
            <section key={label}>
              <h2 className="mb-2 px-1 font-mono text-[11px] tracking-widest text-ink-500 uppercase">
                {label}
              </h2>
              <ul className="flex flex-col">
                {items.map((tx) => (
                  <li key={tx.id}>
                    <TransactionRow tx={tx} linkTo={`/transactions/${tx.id}`} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {hasMore && (
            <SubmitButton
              onClick={() => setSize(size + 1)}
              loading={isLoadingMore}
              className="w-full border border-ink-200 bg-paper text-ink-700 hover:bg-shell"
              size="lg"
              variant="outline"
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </SubmitButton>
          )}
        </div>
      )}
    </div>
  );
}

// --- helpers ---

function groupByDay(
  items: Transaction[],
): { label: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();

  for (const tx of items) {
    const label = dayLabel(tx.completedAt ?? tx.initiatedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(tx);
  }

  // Map preserves insertion order — transactions arrive sorted DESC by initiatedAt.
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

function dayLabel(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return then.toLocaleDateString("en-NG", { weekday: "long" });
  return then.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year:
      then.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const copy: Record<Filter, { title: string; body: string }> = {
    all: {
      title: "Nothing here yet.",
      body: "Send your first transfer to see it show up here.",
    },
    SUCCESS: {
      title: "No successful transfers.",
      body: "When you send money and it goes through, it lands here.",
    },
    FAILED: {
      title: "No failed transfers.",
      body: "That's a good problem to have.",
    },
    PENDING: {
      title: "No pending transfers.",
      body: "Anything mid-flight will show here.",
    },
  };
  const { title, body } = copy[filter];
  return (
    <div className="rounded-md border border-ink-200 bg-shell p-8 text-center">
      <p
        className="mb-1 font-serif text-lg tracking-tight text-ink-700 italic"
        style={{ fontVariationSettings: "'SOFT' 100" }}
      >
        {title}
      </p>
      <p className="font-sans text-sm text-ink-500">{body}</p>
    </div>
  );
}
