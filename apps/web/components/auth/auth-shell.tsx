import type { ReactNode } from "react";
import { LogoLockup } from "@/components/brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center px-6 pt-16 pb-8">
      <div className="flex w-full max-w-105 flex-col gap-14">
        <LogoLockup
          orientation="vertical"
          size="md"
          tagline="banking made kind"
        />
        {children}
      </div>
    </main>
  );
}
