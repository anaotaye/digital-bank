import { RequestHandler } from "express";
import { SeedBvnInput, SeedNinInput } from "@repo/shared";
import { Customer } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { insertBvn, insertNin } from "../services/nibss/endpoints.js";

/**
 * POST /api/kyc/bvn
 *
 * Seed (register) a BVN into NIBSS and link it to the customer's account.
 * Body is pre-validated by validate(SeedBvnSchema) middleware.
 * Requires authentication.
 *
 * Flow:
 * 1. Call NIBSS insertBvn endpoint to register the BVN
 * 2. If NIBSS succeeds, link the KYC to the customer record
 * 3. If NIBSS fails (409 conflict, 400 bad input, etc), propagate the error
 *    and DO NOT update customer.kyc — atomicity matters
 */
export const seedBvn: RequestHandler<never, any, SeedBvnInput> = async (
  req,
  res,
  next,
) => {
  try {
    const { bvn, firstName, lastName, dob, phone } = req.body;

    // Register the BVN in NIBSS's central identity store.
    // If NIBSS rejects (e.g., 409 conflict — BVN already taken by another customer),
    // this axios error bubbles up to errorHandler and nothing is saved locally.
    await insertBvn({ bvn, firstName, lastName, dob, phone });

    // Only after NIBSS succeeded do we link this KYC to the customer.
    // Atomicity: we never claim a customer is KYC'd without a real NIBSS record backing it.
    const customer = await Customer.findByIdAndUpdate(
      req.customer!.id,
      { kyc: { type: "BVN", value: bvn, seededAt: new Date() } },
      { new: true },
    );

    if (!customer) {
      // Extremely unlikely: token valid but customer deleted mid-request
      return next(new AppError(404, "Customer not found"));
    }

    return res.status(201).json({
      message: "BVN seeded and linked to customer",
      kyc: customer.kyc,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/kyc/nin
 *
 * Seed (register) a NIN into NIBSS and link it to the customer's account.
 * Body is pre-validated by validate(SeedNinSchema) middleware.
 * Requires authentication.
 *
 * Flow: identical to seedBvn, only field names differ.
 *
 * Business rule: A customer can have at most one active KYC record.
 * Seeding a new KYC (even same type) overwrites the previous one.
 * NIBSS stores each KYC separately — conflicts only occur if the exact
 * number (BVN or NIN) is already registered globally.
 */
export const seedNin: RequestHandler<never, any, SeedNinInput> = async (
  req,
  res,
  next,
) => {
  try {
    const { nin, firstName, lastName, dob } = req.body;

    // Register the NIN in NIBSS's central identity store.
    await insertNin({ nin, firstName, lastName, dob });

    // Link to customer only after NIBSS succeeded.
    const customer = await Customer.findByIdAndUpdate(
      req.customer!.id,
      { kyc: { type: "NIN", value: nin, seededAt: new Date() } },
      { new: true },
    );

    if (!customer) {
      return next(new AppError(404, "Customer not found"));
    }

    return res.status(201).json({
      message: "NIN seeded and linked to customer",
      kyc: customer.kyc,
    });
  } catch (err) {
    next(err);
  }
};
