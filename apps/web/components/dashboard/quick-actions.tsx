"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ArrowUp, Share2, Receipt } from "lucide-react";

type QuickActionsProps = {
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export function QuickActions({
  accountName,
  accountNumber,
  bankName,
}: QuickActionsProps) {
  const share = async () => {
    const text = `Account name: ${accountName}\nBank name: ${bankName}\nAccount number: ${accountNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        toast.error("Couldn't share");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Account details copied — share it with anyone.");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="mb-6 grid grid-cols-3 gap-2.5">
      <Link href="/transfer">
        <ActionButton icon={ArrowUp} label="Send" />
      </Link>
      <ActionButton icon={Share2} label="Share" onClick={share} as="button" />
      <Link href="/transactions">
        <ActionButton icon={Receipt} label="History" />
      </Link>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  as = "div",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
  as?: "div" | "button";
}) {
  const Comp = as;
  return (
    <Comp
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-md border border-ink-200 bg-paper px-2 py-3.5 transition-all hover:border-ink-300 hover:shadow-warm"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </div>
      <span className="font-sans text-xs font-medium text-ink-700">
        {label}
      </span>
    </Comp>
  );
}
