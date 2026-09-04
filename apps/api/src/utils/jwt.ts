import jwt, { VerifyOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

// JWT payload contains only the customer ID.
// Email and name are NOT included because:
// 1. Keep tokens small (faster transmission, better performance)
// 2. Avoid stale data (if user updates their name, old tokens still have old name)
// 3. Fetch customer details from DB when needed — DB is source of truth
export type CustomerTokenPayload = { id: string };

export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as any);
}

export function verifyCustomerToken(token: string): CustomerTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {});
  if (typeof decoded === "string" || !decoded.id) {
    throw new Error("Invalid token payload");
  }
  return { id: decoded.id as string };
}
