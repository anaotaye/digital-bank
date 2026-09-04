import { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyCustomerToken } from "../utils/jwt.js";

export const authenticateCustomer: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or malformed Authorization header"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyCustomerToken(token);
    req.customer = { id: payload.id };
    next();
  } catch {
    // Deliberately generic — don't leak whether token was expired vs malformed vs signed with wrong key
    return next(new AppError(401, "Invalid or expired token"));
  }
};
