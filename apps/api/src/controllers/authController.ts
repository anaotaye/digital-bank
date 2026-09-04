import { RequestHandler } from "express";
import { SignupInput, LoginInput } from "@repo/shared";
import { Customer } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signCustomerToken } from "../utils/jwt.js";

/**
 * POST /api/auth/signup
 *
 * Create a new customer account.
 * Body is pre-validated by validate(SignupSchema) middleware.
 */
export const signup: RequestHandler<
  never,
  { customer: any; token: string },
  SignupInput
> = async (req, _res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if email is already registered
    const existing = await Customer.findOne({ email });
    if (existing) {
      return next(new AppError(409, "Email already registered"));
    }

    // Hash password — bcryptjs is slow by design (security feature)
    const passwordHash = await hashPassword(password);

    // Create customer
    const customer = await Customer.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    // Sign JWT with only the customer ID (no email/name — DB is source of truth)
    const token = signCustomerToken({ id: customer._id.toString() });

    // customer.toJSON() auto-strips passwordHash and __v
    return _res.status(201).json({ customer, token });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 *
 * Verify credentials and return JWT.
 * Body is pre-validated by validate(LoginSchema) middleware.
 *
 * Security: Unknown email and wrong password return identical errors (401 "Invalid email or password").
 * This prevents attackers from enumerating registered email addresses.
 */
export const login: RequestHandler<
  never,
  { customer: any; token: string },
  LoginInput
> = async (req, _res, next) => {
  try {
    const { email, password } = req.body;

    // Query customer by email, explicitly fetching passwordHash (which is select: false by default)
    const customer = await Customer.findOne({ email }).select("+passwordHash");

    // No customer found → same error as wrong password (no email enumeration)
    if (!customer) {
      return next(new AppError(401, "Invalid email or password"));
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.passwordHash);

    // Wrong password → same error as unknown email (no email enumeration)
    if (!isValid) {
      return next(new AppError(401, "Invalid email or password"));
    }

    // Sign JWT
    const token = signCustomerToken({ id: customer._id.toString() });

    // customer.toJSON() auto-strips passwordHash and __v
    return _res.status(200).json({ customer, token });
  } catch (err) {
    next(err);
  }
};
