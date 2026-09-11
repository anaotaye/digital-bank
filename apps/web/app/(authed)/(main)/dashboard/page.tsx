"use client";

import { useAuth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { customer, isLoading } = useAuth();

  // The (authed) layout already redirects when there's no session; this also
  // narrows the type and covers the brief pre-hydration render.
  if (!customer?.account) return isLoading ? <DashboardSkeleton /> : null;

  return (
    <div className="flex flex-col">
      <DashboardHeader customer={customer} />
      <BalanceCard accountNumber={customer.account.number} />
      <QuickActions
        accountName={`${customer.firstName} ${customer.lastName}`}
        accountNumber={customer.account.number}
        bankName={customer.account.bankName ?? "Ann's Bank"}
      />
      <RecentActivity />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <Skeleton className="mb-5 h-45 w-full rounded-xl" />
      <div className="mb-6 grid grid-cols-3 gap-2.5">
        <Skeleton className="h-22 rounded-md" />
        <Skeleton className="h-22 rounded-md" />
        <Skeleton className="h-22 rounded-md" />
      </div>
      <Skeleton className="mb-3 h-5 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
