"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ErrorBanner } from "@/components/auth/error-banner";
import { api, ApiError } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import type { Recipient, TransferResult } from "@/components/transfer/types";

type BalanceResponse = { accountNumber: string; balance: number };

export function ConfirmStep({
  accountNumber,
  recipient,
  amount,
  onSuccess,
  onFailure,
}: {
  accountNumber: string;
  recipient: Recipient;
  amount: number;
  onSuccess: (r: TransferResult) => void;
  onFailure: (reason: string) => void;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { data: balanceData, mutate: mutateBalance } =
    useSWR<BalanceResponse>(
      ["/api/account/balance", accountNumber],
      ([path]) => api<BalanceResponse>(path),
    );

  const balance =
    balanceData?.accountNumber === accountNumber ? balanceData.balance : 0;
  const balanceAfter = balance - amount;

  const send = async () => {
    setApiError(null);
    setIsBusy(true);
    try {
      const res = await api<{ message: string; transaction: TransferResult }>(
        "/api/transfer",
        {
          method: "POST",
          body: {
            toAccountNumber: recipient.accountNumber,
            amount,
            recipientName: recipient.accountName,
            recipientBankCode: recipient.bankCode,
          },
        },
      );
      // Refetch the balance so the dashboard is current when the user returns.
      mutateBalance();
      onSuccess(res.transaction);
    } catch (err) {
      const reason =
        err instanceof ApiError
          ? err.message
          : "The transfer could not be completed.";
      onFailure(reason);
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <ErrorBanner message={apiError} />

      {/* Recipient card */}
      <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-paper p-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-xl font-medium text-cream italic"
          style={{
            background: "linear-gradient(135deg, #B7863C, #A87029)",
            fontVariationSettings: "'SOFT' 100",
          }}
        >
          {recipient.accountName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="font-serif text-lg leading-tight font-medium tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            {recipient.accountName}
          </div>
          <div className="mt-0.5 font-mono text-xs text-ink-500">
            {recipient.accountNumber} · {recipient.bankCode}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3 text-success" strokeWidth={2.5} />
            <span className="font-sans text-[10px] font-semibold tracking-wider text-success uppercase">
              Verified with NIBSS
            </span>
          </div>
        </div>
      </div>

      {/* Amount card */}
      <div className="rounded-xl border border-primary-soft bg-linear-to-br from-primary-tint to-primary-soft p-6 text-center">
        <div className="mb-1.5 font-sans text-xs tracking-wide text-ink-700">
          You&apos;re sending
        </div>
        <div
          className="font-serif text-[44px] leading-none font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          <span className="mr-0.5 text-[34px] text-primary">₦</span>
          {amount.toLocaleString("en-NG")}
        </div>
        <div className="mt-4 border-t border-primary/10 pt-3.5 font-sans text-xs text-ink-700">
          Balance after:{" "}
          <strong className="text-ink-950">{formatNaira(balanceAfter)}</strong>
        </div>
      </div>

      <p className="px-2 text-center font-sans text-xs leading-relaxed text-ink-500">
        Transfers can&apos;t be reversed once sent. Double-check the recipient.
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <SubmitButton
          size="lg"
          className="w-full"
          loading={isBusy}
          onClick={send}
        >
          {isBusy
            ? "Sending…"
            : `Send ${formatNaira(amount, { compact: true })}`}
        </SubmitButton>
      </div>
    </div>
  );
}
