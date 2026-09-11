import Link from "next/link";
import { initials } from "@/lib/utils";
import type { Customer } from "@/lib/auth";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({ customer }: { customer: Customer }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-sans text-[13px] tracking-wide text-ink-500">
          {greeting()}
        </span>
        <span
          className="font-serif text-[22px] leading-tight font-medium tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          {customer.firstName}
        </span>
      </div>

      <Link
        href="/profile"
        className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg font-medium text-cream italic outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        style={{
          background: "linear-gradient(135deg, #C9522F, #B7863C)",
          fontVariationSettings: "'SOFT' 100",
        }}
        aria-label={`Open ${customer.firstName}'s profile`}
      >
        {initials(customer.firstName, customer.lastName)}
      </Link>
    </header>
  );
}
