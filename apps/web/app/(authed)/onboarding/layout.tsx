"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNextRoute } from "@/lib/routing";
import { LogoMark } from "@/components/brand";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !customer) return;

    // Where the customer SHOULD be based on their state
    const target = getNextRoute(customer);

    // On an onboarding page but should be elsewhere → send them there
    if (target !== pathname) {
      router.replace(target);
    }
  }, [customer, isLoading, pathname, router]);

  if (isLoading || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LogoMark className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
