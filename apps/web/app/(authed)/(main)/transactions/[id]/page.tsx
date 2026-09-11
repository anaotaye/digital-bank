"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Copy as CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TransactionAvatar } from "@/components/transactions/transaction-row";
import { ReceiptActions } from "@/components/transactions/receipt-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Skeleton } from "@/components/ui/skeleton";

type TxDetail = {
  transaction: {
    id: string;
    nibssTransactionId: string | null;
    status: "PENDING" | "SUCCESS" | "FAILED";
    amount: number;
    from: string;
    to: string;
    recipientName?: string | null;
    recipientBankCode?: string | null;
    initiatedAt: string;
    completedAt?: string | null;
    nibss?: unknown;
  };
};

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const { data, error, isLoading } = useSWR<TxDetail>(`/api/transactions/${id}`);

  const backToList = () => {
    setIsNavigating(true);
    router.push("/transactions");
  };

  if (isLoading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <XCircle className="h-8 w-8 text-ink-400" strokeWidth={1.5} />
        <div>
          <h1
            className="font-serif text-xl font-medium tracking-tight text-ink-900"
            style={{ fontVariationSettings: "'SOFT' 100" }}
          >
            Transaction not found
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-500">
            It may have been removed, or it doesn&apos;t belong to you.
          </p>
        </div>
        <Link
          href="/transactions"
          className="font-sans text-sm font-semibold text-primary hover:underline"
        >
          Back to activity
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const tx = data.transaction;
  const label = tx.recipientName ?? tx.to;
  const initial = (
    tx.recipientName?.slice(0, 1) ?? tx.to.slice(0, 1)
  ).toUpperCase();

  const copyRef = async () => {
    if (!tx.nibssTransactionId) return;
    try {
      await navigator.clipboard.writeText(tx.nibssTransactionId);
      toast.success("Reference copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-paper text-ink-900 transition-colors hover:border-ink-300"
          aria-label="Back to activity"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </Link>
        <h1
          className="font-serif text-xl font-medium tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Transaction
        </h1>
      </header>

      {/* Status + Amount */}
      <div className="rounded-xl border border-ink-200 bg-paper p-6 text-center">
        <StatusPill status={tx.status} />
        <div
          className={cn(
            "mt-4 font-serif leading-none font-normal tracking-tight",
            tx.status === "FAILED" ? "text-ink-400" : "text-ink-950",
          )}
          style={{
            fontVariationSettings: "'SOFT' 100, 'opsz' 144",
            fontSize: "clamp(40px, 10vw, 56px)",
          }}
        >
          <span
            className="text-primary"
            style={{ fontSize: "0.75em", marginRight: "0.05em" }}
          >
            ₦
          </span>
          {tx.amount.toLocaleString("en-NG")}
        </div>
        <p className="mt-3 font-sans text-sm text-ink-500">
          Sent to <span className="font-medium text-ink-700">{label}</span>
        </p>
      </div>

      {/* Recipient details */}
      <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-paper p-5">
        <TransactionAvatar
          seed={tx.recipientName ?? tx.to}
          initial={initial}
          status={tx.status}
          size="md"
          ringClass="ring-paper"
        />
        <div className="min-w-0 flex-1">
          <div
            className="truncate font-serif text-base font-medium text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100" }}
          >
            {tx.recipientName ?? "Unknown recipient"}
          </div>
          <div className="mt-0.5 font-mono text-xs text-ink-500">
            {tx.to} {tx.recipientBankCode && `· ${tx.recipientBankCode}`}
          </div>
        </div>
      </div>

      {/* Timeline / meta */}
      <div className="divide-y divide-ink-200 rounded-md border border-ink-200 bg-shell">
        <MetaRow label="Initiated" value={formatDateTime(tx.initiatedAt)} />
        {tx.completedAt && (
          <MetaRow
            label={tx.status === "FAILED" ? "Failed at" : "Completed"}
            value={formatDateTime(tx.completedAt)}
          />
        )}
        <MetaRow label="From account" value={tx.from} mono />
        {tx.nibssTransactionId && (
          <MetaRow
            label="Reference"
            value={tx.nibssTransactionId}
            mono
            action={
              <button
                onClick={copyRef}
                className="text-ink-500 transition-colors hover:text-primary"
                aria-label="Copy reference"
              >
                <CopyIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            }
          />
        )}
      </div>

      {tx.status !== "FAILED" && (
        <ReceiptActions
          transactionId={tx.id}
          amount={tx.amount}
          recipientName={tx.recipientName}
        />
      )}

      <SubmitButton
        size="lg"
        className="mt-2 w-full"
        variant="outline"
        loading={isNavigating}
        onClick={backToList}
      >
        Back to activity
      </SubmitButton>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "PENDING" | "SUCCESS" | "FAILED";
}) {
  const config = {
    SUCCESS: {
      icon: CheckCircle2,
      label: "Successful",
      classes: "bg-success-soft text-success",
    },
    FAILED: {
      icon: XCircle,
      label: "Failed",
      classes: "bg-danger/10 text-danger",
    },
    PENDING: {
      icon: Clock,
      label: "Pending",
      classes: "bg-shell text-ink-700",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-semibold",
        config.classes,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {config.label}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
  action,
}: {
  label: string;
  value: string;
  mono?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="font-sans text-xs tracking-wider text-ink-500 uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm text-ink-700",
            mono ? "font-mono text-xs" : "font-sans",
          )}
        >
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-md" />
    </div>
  );
}
