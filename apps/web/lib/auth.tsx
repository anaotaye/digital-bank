"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { mutate } from "swr";
import { api, ApiError } from "./api";

// Shape of what /api/me returns
export type Customer = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  kyc?: { type: "BVN" | "NIN"; value: string; seededAt: string };
  account?: {
    number: string;
    bankCode: string;
    bankName?: string;
    createdAt: string;
  };
};

type AuthContextValue = {
  customer: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Customer>;
  signup: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api<{ customer: Customer }>("/api/me");
      setCustomer(res.customer);
    } catch (err) {
      // 401 just means no cookie / expired — normal, not an error to log
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error("Failed to refresh session", err);
      }
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer off the synchronous effect body — refresh() ends in setState and
    // React 19 flags setState called synchronously inside an effect. Calling
    // refresh() directly from event handlers (login/signup/logout) stays fine.
    let active = true;
    queueMicrotask(() => {
      if (active) void refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    // Cookie is set server-side. Response body only has customer.
    const res = await api<{ customer: Customer }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setCustomer(res.customer);
    return res.customer;
  }, []);

  const signup = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await api<{ customer: Customer }>("/api/auth/signup", {
        method: "POST",
        body: input,
      });
      setCustomer(res.customer);
    },
    [],
  );

  const logout = useCallback(async () => {
    // Even if the network call fails, clear local state — user intent is to log out.
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — cookie may already be cleared, or network is down
    }
    await mutate(
      (key) =>
        (typeof key === "string" && key.startsWith("/api/")) ||
        (Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/")),
      undefined,
      { revalidate: false },
    );
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, isLoading, login, signup, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
