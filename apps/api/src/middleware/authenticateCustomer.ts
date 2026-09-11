import { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyCustomerToken } from "../utils/jwt.js";
import { AUTH_COOKIE_NAME } from "../utils/cookies.js";

export const authenticateCustomer: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new AppError(401, "Not authenticated"));
  }

  try {
    const payload = verifyCustomerToken(token);
    req.customer = { id: payload.id };
    next();
  } catch {
    // Deliberately generic — don't leak whether token was expired vs malformed
    return next(new AppError(401, "Invalid or expired session"));
  }
};
