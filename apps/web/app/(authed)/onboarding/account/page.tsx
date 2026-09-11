"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/utils";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { ErrorBanner } from "@/components/auth/error-banner";
import { SubmitButton } from "@/components/ui/submit-button";

type CreatedAccount = {
  number: string;
  bankCode: string;
  bankName?: string;
  balance: number;
  createdAt?: string;
};

type CreateResponse = {
  message: string;
  account: CreatedAccount;
};

export default function AccountPage() {
  const [status, setStatus] = useState<"idle" | "creating" | "done">("idle");
  const [account, setAccount] = useState<CreatedAccount | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const onCreate = async () => {
    setApiError(null);
    setStatus("creating");
    try {
      const res = await api<CreateResponse>("/api/account", { method: "POST" });
      setAccount(res.account);
      setStatus("done");
      // NOTE: we deliberately do NOT refresh() here. The moment customer.account
      // is populated, the onboarding layout guard redirects to /dashboard —
      // which would yank the success screen out from under the customer.
      // refresh() happens when they choose to leave (see SuccessState).
    } catch (err) {
      setStatus("idle");
      setApiError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (status === "done" && account) {
    return <SuccessState account={account} />;
  }

  return (
    <AuthShell>
      <StepIndicator current={2} />

      <div>
        <h1
          className="font-serif text-[30px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Ready to open your <em className="text-primary italic">account</em>?
        </h1>
        <p className="mt-2 font-sans text-sm leading-snug text-ink-500">
          We&apos;ll open your Ann&apos;s Bank account and credit it with
          ₦15,000 so you can start moving money right away.
        </p>
      </div>

      <ErrorBanner message={apiError} />

      <div className="mt-auto flex flex-col gap-3">
        <SubmitButton
          size="lg"
          className="w-full"
          onClick={onCreate}
          loading={status === "creating"}
        >
          {status === "creating" ? "Setting things up…" : "Open my account"}
        </SubmitButton>
      </div>
    </AuthShell>
  );
}

function SuccessState({ account }: { account: CreatedAccount }) {
  const { refresh } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const goToDashboard = async () => {
    setIsNavigating(true);
    // refresh() first so customer.account is in context when /dashboard renders
    // (the dashboard returns null without it). The spinner covers this + the nav;
    // we never reset isNavigating — this component unmounts on the redirect.
    await refresh();
    router.replace("/dashboard");
  };

  return (
    <AuthShell>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <div>
          <div className="font-mono text-[11px] tracking-widest text-primary uppercase">
            Welcome to Ann&apos;s
          </div>
          <h1
            className="mt-3 font-serif text-[32px] leading-tight font-normal tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            Your account <em className="text-primary italic">is ready</em>.
          </h1>
        </div>

        <div className="rounded-xl border border-primary-soft bg-linear-to-br from-primary-tint to-primary-soft p-6">
          <div className="font-sans text-xs tracking-wide text-ink-700">
            Opening balance
          </div>
          <div
            className="mt-1 font-serif text-[44px] leading-none font-normal tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            <span className="mr-0.5 text-[34px] text-primary">₦</span>
            {formatNaira(account.balance, { compact: true }).replace("₦", "")}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4">
            <span className="font-mono text-xs text-ink-500">
              {account.number}
            </span>
            <span className="font-sans text-[11px] tracking-wider text-ink-500 uppercase">
              Your account number
            </span>
          </div>
        </div>

        <p className="font-sans text-sm leading-relaxed text-ink-700">
          You&apos;ll use this account number to receive money. Send it to
          friends, save it for later — it&apos;s yours.
        </p>

        <SubmitButton
          size="lg"
          className="mt-4 w-full"
          onClick={goToDashboard}
          loading={isNavigating}
        >
          {isNavigating ? "Opening dashboard…" : "Go to my dashboard"}
        </SubmitButton>
      </div>
    </AuthShell>
  );
}
