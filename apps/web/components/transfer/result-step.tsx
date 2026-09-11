"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ReceiptActions } from "@/components/transactions/receipt-actions";
import { formatNaira, relativeTime } from "@/lib/utils";
import type { TransferResult } from "@/components/transfer/types";

export function ResultStep({
  result,
  failureReason,
}: {
  result: TransferResult | null;
  failureReason: string | null;
}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const goHome = () => {
    setIsNavigating(true);
    router.push("/dashboard");
  };

  if (failureReason) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <XCircle className="h-8 w-8 text-danger" strokeWidth={1.75} />
        </div>
        <div>
          <h1
            className="mb-2 font-serif text-[28px] leading-tight font-normal tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            Transfer <em className="text-danger italic">failed</em>.
          </h1>
          <p className="mx-auto max-w-70 font-sans text-sm text-ink-500">
            {failureReason}
          </p>
        </div>
        <SubmitButton
          size="lg"
          className="mt-auto w-full"
          loading={isNavigating}
          onClick={goHome}
        >
          Back to home
        </SubmitButton>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center animate-in fade-in duration-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
        <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.75} />
      </div>

      <div>
        <div className="mb-2 font-mono text-[11px] tracking-widest text-success uppercase">
          Money&apos;s on its way
        </div>
        <h1
          className="font-serif text-[30px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Sent{" "}
          <em className="text-primary italic">
            {formatNaira(result.amount, { compact: true })}
          </em>
        </h1>
        <p className="mt-3 font-sans text-sm text-ink-500">
          To {result.recipientName}
        </p>
      </div>

      <div className="w-full rounded-md border border-ink-200 bg-shell px-4 py-3 text-left">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs tracking-wider text-ink-500 uppercase">
            Reference
          </span>
          <span className="font-mono text-xs text-ink-700">
            {result.nibssTransactionId}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-sans text-xs tracking-wider text-ink-500 uppercase">
            When
          </span>
          <span className="font-sans text-xs text-ink-700">
            {relativeTime(result.initiatedAt)}
          </span>
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col gap-2">
        <ReceiptActions
          transactionId={result.id}
          amount={result.amount}
          recipientName={result.recipientName}
        />
        <SubmitButton
          size="lg"
          className="w-full"
          loading={isNavigating}
          onClick={goHome}
        >
          Back to home
        </SubmitButton>
      </div>
    </div>
  );
}
