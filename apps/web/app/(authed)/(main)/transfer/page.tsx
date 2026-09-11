"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RecipientStep } from "@/components/transfer/recipient-step";
import { AmountStep } from "@/components/transfer/amount-step";
import { ConfirmStep } from "@/components/transfer/confirm-step";
import { ResultStep } from "@/components/transfer/result-step";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Recipient,
  TransferResult,
  TransferStep,
} from "@/components/transfer/types";

export type { Recipient, TransferResult } from "@/components/transfer/types";

export default function TransferPage() {
  const router = useRouter();
  const { customer, isLoading } = useAuth();

  const [step, setStep] = useState<TransferStep>("recipient");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  if (!customer?.account) return isLoading ? <TransferSkeleton /> : null;

  const goBack = () => {
    if (step === "recipient") router.push("/dashboard");
    else if (step === "amount") setStep("recipient");
    else if (step === "confirm") setStep("amount");
    // On 'result', the back button is hidden — the user uses "Back to home".
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      {step !== "result" && (
        <header className="mb-8 flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-paper text-ink-900 transition-colors hover:border-ink-300"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <h1
            className="font-serif text-xl font-medium tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            {step === "recipient" && "Send money"}
            {step === "amount" && "Enter amount"}
            {step === "confirm" && "Confirm transfer"}
          </h1>
        </header>
      )}

      {step === "recipient" && (
        <RecipientStep
          myAccount={customer.account.number}
          initialAccountNumber={recipient?.accountNumber}
          onNext={(r) => {
            setRecipient(r);
            setStep("amount");
          }}
        />
      )}

      {step === "amount" && recipient && (
        <AmountStep
          accountNumber={customer.account.number}
          recipient={recipient}
          initialAmount={amount || undefined}
          onNext={(amt) => {
            setAmount(amt);
            setStep("confirm");
          }}
        />
      )}

      {step === "confirm" && recipient && (
        <ConfirmStep
          accountNumber={customer.account.number}
          recipient={recipient}
          amount={amount}
          onSuccess={(res) => {
            setResult(res);
            setStep("result");
          }}
          onFailure={(reason) => {
            setFailureReason(reason);
            setStep("result");
          }}
        />
      )}

      {step === "result" && (
        <ResultStep result={result} failureReason={failureReason} />
      )}
    </div>
  );
}

function TransferSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-12 w-full" />
      <Skeleton className="mt-5 h-12 w-full" />
    </div>
  );
}
