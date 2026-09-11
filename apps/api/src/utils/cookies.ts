import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

const COOKIE_NAME = "token";

/**
 * Base cookie options shared by set and clear. clearCookie only clears the
 * cookie if these options match what was originally set (minus maxAge/expires).
 */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production", // http on localhost, https everywhere else
  sameSite: "strict", // cookie only sent for same-site requests
  path: "/",
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — match JWT expiry
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
