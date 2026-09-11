"use client";

import { SWRConfig } from "swr";
import { api, ApiError } from "./api";

const fetcher = <T,>(path: string): Promise<T> => api<T>(path);

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true, // refetch balance / txs when the tab regains focus
        dedupingInterval: 2000, // dedupe identical requests within 2s
        errorRetryCount: 2, // don't retry infinitely on failure
        shouldRetryOnError: (err) => {
          // Don't retry auth failures — the user needs to log in again
          return !(err instanceof ApiError && err.status === 401);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
