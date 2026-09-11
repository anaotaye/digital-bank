"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !customer) {
      router.replace("/login");
    }
  }, [customer, isLoading, router]);

  // Render the app shell while the session is being restored. Individual pages
  // provide contextual skeletons, which avoids a blank full-page transition.
  if (!isLoading && !customer) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3"
        role="status"
      >
        <LoaderCircle
          className="h-6 w-6 animate-spin text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="font-sans text-sm text-ink-500">Redirecting...</span>
      </div>
    );
  }

  return <>{children}</>;
}
