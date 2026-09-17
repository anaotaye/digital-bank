"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUp, Share2, Receipt, Loader2 } from "lucide-react";

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
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    setIsSharing(true);
    try {
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
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="mb-6 grid grid-cols-3 gap-2.5">
      <Link href="/transfer">
        <ActionButton icon={ArrowUp} label="Send" />
      </Link>
      <ActionButton
        icon={Share2}
        label="Share"
        onClick={share}
        as="button"
        loading={isSharing}
      />
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
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
  as?: "div" | "button";
  loading?: boolean;
}) {
  const Comp = as;
  return (
    <Comp
      onClick={loading ? undefined : onClick}
      disabled={as === "button" ? loading : undefined}
      aria-busy={loading || undefined}
      className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-md border border-ink-200 bg-paper px-2 py-3.5 transition-all hover:border-ink-300 hover:shadow-warm disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
        ) : (
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        )}
      </div>
      <span className="font-sans text-xs font-medium text-ink-700">
        {label}
      </span>
    </Comp>
  );
}
