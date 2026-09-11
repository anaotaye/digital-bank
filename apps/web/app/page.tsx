"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNextRoute } from "@/lib/routing";
import { LogoMark } from "@/components/brand";

export default function Home() {
  const { customer, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(getNextRoute(customer));
  }, [customer, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LogoMark className="h-12 w-12 animate-pulse" />
    </div>
  );
}
