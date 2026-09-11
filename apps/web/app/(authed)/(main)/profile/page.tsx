"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Copy as CopyIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initials, maskId } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { customer, isLoading, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);


  if (!customer) return isLoading ? <ProfileSkeleton /> : null;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const signOut = async () => {
    setIsSigningOut(true);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-serif text-[26px] font-medium tracking-tight text-ink-950"
        style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
      >
        Profile
      </h1>

      {/* Identity card */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-200 bg-paper p-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full font-serif text-2xl font-medium text-cream italic"
          style={{
            background: "linear-gradient(135deg, #C9522F, #B7863C)",
            fontVariationSettings: "'SOFT' 100",
          }}
          role="img"
          aria-label={`Avatar for ${customer.firstName} ${customer.lastName}`}
        >
          {initials(customer.firstName, customer.lastName).slice(0, 1)}
        </div>
        <div>
          <div
            className="font-serif text-xl font-medium tracking-tight text-ink-950"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            {customer.firstName} {customer.lastName}
          </div>
          <div className="mt-0.5 font-sans text-sm text-ink-500">
            {customer.email}
          </div>
        </div>
      </div>

      {/* Account section */}
      {customer.account && (
        <Section title="Account">
          <Row
            label="Account number"
            value={customer.account.number}
            mono
            action={
              <button
                onClick={() =>
                  copy(customer.account!.number, "Account number")
                }
                className="text-ink-500 transition-colors hover:text-primary"
                aria-label="Copy account number"
              >
                <CopyIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            }
          />
          <Row
            label="Bank"
            value={customer.account.bankName ?? "Ann's Bank"}
          />
          <Row label="Bank code" value={customer.account.bankCode} mono />
        </Section>
      )}

      {/* KYC section */}
      {customer.kyc && (
        <Section title="Identity">
          <div className="flex items-start gap-3 px-4 py-3">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-success"
              strokeWidth={2}
            />
            <div className="flex-1">
              <div className="font-sans text-sm font-medium text-ink-900">
                Verified with {customer.kyc.type}
              </div>
              <div className="mt-0.5 font-mono text-xs text-ink-500">
                {maskId(customer.kyc.value)}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* About section */}
      <Section title="About">
        <Row label="App" value="Ann's Bank v1.0" />
        <Row label="Built for" value="NIBSS by Phoenix · TS Academy" />
      </Section>

      {/* Sign out */}
      <SubmitButton
        variant="outline"
        size="lg"
        className="mt-4 w-full"
        loading={isSigningOut}
        onClick={signOut}
      >
        <LogOut className="mr-1 h-4 w-4" strokeWidth={2} />
        Sign out
      </SubmitButton>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-24" />
      <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-200 bg-paper p-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 font-mono text-[11px] tracking-widest text-ink-500 uppercase">
        {title}
      </h2>
      <div className="divide-y divide-ink-200 rounded-md border border-ink-200 bg-paper">
        {children}
      </div>
    </section>
  );
}

function Row({
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
          className={
            mono
              ? "font-mono text-xs text-ink-700"
              : "font-sans text-sm text-ink-700"
          }
        >
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}
