import type { Customer } from "./auth";

/**
 * Given the current customer's state, return the route they should be on.
 * Used after login and on the root page — the single source of truth for
 * post-auth routing.
 */
export function getNextRoute(customer: Customer | null): string {
  if (!customer) return "/login";
  if (!customer.kyc) return "/onboarding/kyc";
  if (!customer.account) return "/onboarding/account";
  return "/dashboard";
}
