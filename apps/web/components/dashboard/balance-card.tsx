"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";

type BalanceResponse = {
  accountNumber: string;
  balance: number;
};

export function BalanceCard({ accountNumber }: { accountNumber: string }) {
  const { data, error, isLoading } = useSWR<BalanceResponse>(
    ["/api/account/balance", accountNumber],
    ([path]) => api<BalanceResponse>(path),
  );
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Account number copied");
    } catch {
      toast.error("Couldn't copy — try selecting it manually");
    }
  };

  return (
    <div className="relative mb-5 overflow-hidden rounded-xl bg-linear-to-br from-ink-900 to-[#292522] p-6 shadow-warm-lg">
      {/* Warm radial accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 opacity-40"
        style={{
          background: "radial-gradient(circle, #C9522F 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 opacity-20"
        style={{
          background: "radial-gradient(circle, #B7863C 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="mb-1.5 font-sans text-xs tracking-wide text-cream/60">
          Your balance
        </div>

        {isLoading || data?.accountNumber !== accountNumber ? (
          <Skeleton className="h-10 w-40 bg-cream/10" />
        ) : error ? (
          <div className="font-sans text-sm text-cream/70">
            Couldn&apos;t load balance
          </div>
        ) : (
          <div
            className="font-serif text-[40px] leading-none font-normal tracking-tight text-cream"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            <span className="mr-0.5 text-[32px] text-cream/80">₦</span>
            {data && formatNaira(data.balance).replace("₦", "")}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-cream/10 pt-4">
          <span className="font-mono text-xs text-cream/60">{accountNumber}</span>
          <button
            onClick={copy}
            className="font-sans text-[11px] tracking-wider text-cream/60 uppercase transition-colors hover:text-cream"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
