"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { SubmitButton } from "@/components/ui/submit-button";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import type { Recipient } from "@/components/transfer/types";

type BalanceResponse = { accountNumber: string; balance: number };

export function AmountStep({
  accountNumber,
  recipient,
  initialAmount,
  onNext,
}: {
  accountNumber: string;
  recipient: Recipient;
  initialAmount?: number;
  onNext: (amount: number) => void;
}) {
  const [rawAmount, setRawAmount] = useState(() =>
    initialAmount ? String(initialAmount) : "",
  );
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: balanceData } = useSWR<BalanceResponse>(
    ["/api/account/balance", accountNumber],
    ([path]) => api<BalanceResponse>(path),
  );
  const balance =
    balanceData?.accountNumber === accountNumber ? balanceData?.balance : 0;

  const amount = Number(rawAmount) || 0;
  const displayAmount = amount ? amount.toLocaleString("en-NG") : "0";
  const insufficientFunds = amount > 0 && amount > balance;
  const canContinue = amount > 0 && !insufficientFunds;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Compact recipient summary */}
      <div className="flex items-center justify-between rounded-md border border-ink-200 bg-shell px-4 py-3">
        <div className="min-w-0">
          <div className="font-sans text-[11px] tracking-wider text-ink-500 uppercase">
            To
          </div>
          <div
            className="truncate font-serif text-base font-medium text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100" }}
          >
            {recipient.accountName}
          </div>
        </div>
        <div className="ml-3 shrink-0 font-mono text-xs text-ink-500">
          {recipient.accountNumber}
        </div>
      </div>

      {/* Big amount display + hidden input */}
      <div
        className="flex flex-1 cursor-text flex-col items-center justify-center py-4"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-center">
          <div
            className={`font-serif leading-none font-normal tracking-tight transition-colors ${
              amount ? "text-ink-950" : "text-ink-300"
            }`}
            style={{
              fontVariationSettings: "'SOFT' 100, 'opsz' 144",
              fontSize: "clamp(48px, 12vw, 72px)",
            }}
          >
            <span
              className={amount ? "text-primary" : "text-primary/40"}
              style={{ fontSize: "0.8em", marginRight: "0.05em" }}
            >
              ₦
            </span>
            <span className="relative">
              {displayAmount}
              {focused && (
                <span
                  aria-hidden
                  className="absolute top-1/2 right-[-0.14em] h-[0.72em] w-0.75 -translate-y-1/2 rounded-full bg-primary animate-caret-blink"
                />
              )}
            </span>
          </div>
          <p className="mt-4 font-sans text-sm text-ink-500">
            Balance: {formatNaira(balance)}
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={rawAmount}
          onChange={(e) =>
            setRawAmount(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="sr-only"
          aria-label="Amount to send"
        />
      </div>

      {insufficientFunds && (
        <p className="text-center font-sans text-sm text-danger">
          Not enough balance to send this amount.
        </p>
      )}

      <div className="sticky bottom-24 z-10 -mx-6 bg-cream px-6 pt-2 lg:bottom-8">
        <SubmitButton
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={() => onNext(amount)}
        >
          Continue
        </SubmitButton>
      </div>
    </div>
  );
}
