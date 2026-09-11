"use client";

import Link from "next/link";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionRow } from "@/components/transactions/transaction-row";
import type { Transaction } from "@/components/transactions/transaction-row";

type TransactionsResponse = {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export function RecentActivity() {
  const { data, error, isLoading } = useSWR<TransactionsResponse>(
    "/api/transactions?limit=4",
  );

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          className="font-serif text-[17px] font-medium tracking-tight text-ink-900"
          style={{ fontVariationSettings: "'SOFT' 100" }}
        >
          Recent activity
        </h2>
        <Link
          href="/transactions"
          className="font-sans text-xs font-semibold text-primary hover:underline"
        >
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="font-sans text-sm text-ink-500">
          Couldn&apos;t load activity.
        </p>
      ) : data && data.transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col">
          {data?.transactions.map((tx) => (
            <li key={tx.id}>
              <TransactionRow tx={tx} linkTo={`/transactions/${tx.id}`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-ink-200 bg-shell p-6 text-center">
      <p
        className="mb-1 font-serif text-[17px] tracking-tight text-ink-700 italic"
        style={{ fontVariationSettings: "'SOFT' 100" }}
      >
        Nothing here yet.
      </p>
      <p className="font-sans text-[13px] text-ink-500">
        Send your first transfer to see it show up here.
      </p>
    </div>
  );
}
