"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { BvnForm } from "./bvn-form";
import { NinForm } from "./nin-form";

type KycType = "BVN" | "NIN";

export default function KycPage() {
  const router = useRouter();
  const { customer, refresh } = useAuth();
  const [type, setType] = useState<KycType>("BVN");

  const onSuccess = async () => {
    await refresh();
    router.replace("/onboarding/account");
  };

  if (!customer) return null; // layout handles this; keeps TS narrow

  return (
    <AuthShell>
      <StepIndicator current={1} />

      <div>
        <h1
          className="font-serif text-[30px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Verify your <em className="text-primary italic">identity</em>
        </h1>
        <p className="mt-2 font-sans text-sm leading-snug text-ink-500">
          We use this to link your account with the NIBSS identity system.
          Nothing here leaves the training simulator.
        </p>
      </div>

      <Toggle value={type} onChange={setType} />

      {type === "BVN" ? (
        <BvnForm customer={customer} onSuccess={onSuccess} />
      ) : (
        <NinForm customer={customer} onSuccess={onSuccess} />
      )}
    </AuthShell>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: KycType;
  onChange: (v: KycType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md bg-shell p-1">
      {(["BVN", "NIN"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            "rounded-md py-2.5 font-sans text-sm font-semibold transition-all " +
            (value === option
              ? "bg-paper text-ink-900 shadow-warm"
              : "text-ink-500 hover:text-ink-700")
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}
