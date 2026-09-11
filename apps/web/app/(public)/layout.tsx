"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNextRoute } from "@/lib/routing";
import { LogoMark } from "@/components/brand";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && customer) {
      // Send them to wherever they belong (onboarding step or dashboard),
      // not a hardcoded route — getNextRoute is the single source of truth.
      router.replace(getNextRoute(customer));
    }
  }, [customer, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LogoMark className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  if (customer) {
    return null;
  }

  return <>{children}</>;
}
