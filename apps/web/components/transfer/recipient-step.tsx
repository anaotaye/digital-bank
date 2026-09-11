"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/auth/error-banner";
import type { Recipient } from "@/components/transfer/types";

type NameEnquiryResponse = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName?: string;
};

export function RecipientStep({
  myAccount,
  initialAccountNumber,
  onNext,
}: {
  myAccount: string;
  initialAccountNumber?: string;
  onNext: (r: Recipient) => void;
}) {
  // Seed from the parent so stepping back to this screen keeps what was typed.
  const [accountNumber, setAccountNumber] = useState(
    () => initialAccountNumber ?? "",
  );

  // Only look up once we have 10 digits AND it isn't the user's own account.
  const shouldLookup =
    /^\d{10}$/.test(accountNumber) && accountNumber !== myAccount;

  const { data, error, isLoading } = useSWR<NameEnquiryResponse>(
    shouldLookup ? `/api/account/name-enquiry/${accountNumber}` : null,
    { revalidateOnFocus: false },
  );

  const isSelfAccount =
    accountNumber.length === 10 && accountNumber === myAccount;

  const handleChange = (v: string) => {
    setAccountNumber(v.replace(/\D/g, "").slice(0, 10));
  };

  const canContinue = !!data && !error;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Label className="mb-1.5 block font-sans text-xs font-medium text-ink-700">
          Recipient&apos;s account number
        </Label>
        <Input
          value={accountNumber}
          onChange={(e) => handleChange(e.target.value)}
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit account number"
          autoFocus
        />
        <p className="mt-2 font-sans text-xs text-ink-500">
          We&apos;ll look up the name automatically once you enter all 10 digits.
        </p>
      </div>

      {isSelfAccount && (
        <ErrorBanner message="You can't transfer to your own account." />
      )}

      {isLoading && (
        <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-paper p-5">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div
          className="flex items-start gap-3 rounded-md border border-danger/20 bg-danger/5 px-4 py-3"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            strokeWidth={2}
          />
          <div className="font-sans text-sm text-danger">
            We couldn&apos;t find that account. Double-check the number and try
            again.
          </div>
        </div>
      )}

      {data && !isLoading && !error && <RecipientCard recipient={data} />}

      <SubmitButton
        size="lg"
        className="mt-auto w-full"
        disabled={!canContinue}
        onClick={() => {
          if (data) onNext(data);
        }}
      >
        Continue
      </SubmitButton>
    </div>
  );
}

function RecipientCard({ recipient }: { recipient: NameEnquiryResponse }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-paper p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
          className="truncate font-serif text-lg leading-tight font-medium tracking-tight text-ink-950"
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
  );
}
