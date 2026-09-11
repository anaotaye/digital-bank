"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <div className="mb-3 font-mono text-[11px] tracking-widest text-danger uppercase">
          Something broke
        </div>
        <h1
          className="font-serif text-[32px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Sorry about that.
        </h1>
        <p className="mx-auto mt-3 max-w-75 font-sans text-sm text-ink-500">
          Something went wrong on our side. Try again — if it keeps happening,
          sign out and back in.
        </p>
      </div>

      <Button onClick={reset} variant="outline" size="lg">
        <RefreshCw className="mr-2 h-4 w-4" strokeWidth={2} />
        Try again
      </Button>
    </main>
  );
}
