import { RequestHandler } from "express";
import { Customer } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import {
  validateBvn,
  validateNin,
  createNibssAccount,
  getBalance,
  nameEnquiry,
} from "../services/nibss/endpoints.js";
import { toIsoDate } from "../utils/date.js";

/**
 * POST /api/account
 *
 * Create a customer's single bank account via NIBSS.
 * This is the first multi-step NIBSS chain in the system.
 * No request body required — all data comes from the customer's existing KYC record.
 * Requires authentication.
 *
 * Business rules:
 * 1. Customer must not already have an account (409)
 * 2. Customer must have completed KYC (BVN or NIN) (400)
 * 3. The KYC must validate in NIBSS's identity store (400 if not found)
 * 4. NIBSS auto-generates 10-digit NUBAN and auto-funds ₦15,000
 *
 * Flow (order matters for atomicity):
 * 1. Load customer from DB
 * 2. Check rule A: no account exists
 * 3. Check rule B: KYC exists
 * 4. Call NIBSS validateBvn/validateNin to confirm KYC exists in NIBSS's identity store
 *    → If NIBSS says invalid, return 400 (ask customer to re-seed)
 *    → If NIBSS errors, propagate via errorHandler
 * 5. Call NIBSS createAccount with validated KYC and DOB
 *    → NIBSS is source of truth; we only save if it succeeds
 * 6. Save account details to customer.account (DO NOT store balance)
 * 7. Return 201 with account details including balance (so customer sees ₦15,000 initial pre-fund)
 */
export const createAccount: RequestHandler = async (req, res, next) => {
  try {
    // Rule 0: Load the customer
    const customer = await Customer.findById(req.customer!.id);
    if (!customer) {
      // Unlikely: token valid but customer deleted mid-request
      return next(new AppError(404, "Customer not found"));
    }

    // Rule A: Each customer can have only one account
    if (customer.account?.number) {
      return next(
        new AppError(409, "You already have an account", {
          accountNumber: customer.account.number,
        }),
      );
    }

    // Rule B: KYC is required before account creation
    if (!customer.kyc?.value) {
      return next(
        new AppError(
          400,
          "You must complete KYC (BVN or NIN) before creating an account",
        ),
      );
    }

    // Step 1: Verify the KYC exists in NIBSS's identity store and fetch the DOB.
    // We use the DOB from NIBSS (the source of truth) rather than asking the customer
    // to re-type it. This prevents drift between what was seeded and what's sent to createAccount.
    // NIBSS stores each KYC separately — this validation confirms our record matches their state.
    const kycType = customer.kyc.type; // 'BVN' | 'NIN'
    const kycValue = customer.kyc.value;

    // Step 1: verify the KYC exists in NIBSS's identity store.
    // The endpoint wrappers normalize BVN and NIN into one shape and throw on failure,
    // so if we get here we have a valid identity with a real DOB.
    const identity =
      kycType === "BVN"
        ? await validateBvn(kycValue)
        : await validateNin(kycValue);

    // Normalize DOB from NIBSS's ISO datetime to YYYY-MM-DD for createAccount
    const dob = toIsoDate(identity.dob);

    // Step 2: create the actual account via NIBSS
    const nibssAccount = await createNibssAccount({
      kycType: kycType === "BVN" ? "bvn" : "nin",
      kycID: kycValue,
      dob,
    });

    // Step 3: Link the account to the customer in our DB.
    // Order matters: NIBSS is the source of truth. We call it first.
    // If saving to our DB fails after NIBSS succeeded, the account exists upstream
    // but not in our records. The customer can contact support to reconcile.
    // We intentionally DO NOT store the balance — always fetch live from NIBSS.
    customer.account = {
      number: nibssAccount.account.accountNumber,
      bankCode: nibssAccount.account.bankCode,
      bankName: nibssAccount.account.bankName,
      createdAt: new Date(),
    };
    await customer.save();

    // Step 4: Respond with the created account.
    // Include the balance so the customer sees their ₦15,000 in the same response.
    return res.status(201).json({
      message: "Account created successfully",
      account: {
        number: nibssAccount.account.accountNumber,
        bankCode: nibssAccount.account.bankCode,
        bankName: nibssAccount.account.bankName,
        balance: nibssAccount.account.balance, // ₦15,000 initial pre-fund from NIBSS
        createdAt: customer.account.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/account/balance
 *
 * Return the authenticated customer's own balance, fetched live from NIBSS.
 * We never store or cache balance — it always comes fresh from NIBSS.
 * Requires authentication.
 *
 * Business rules:
 * 1. Customer must exist (404)
 * 2. Customer must already have an account (400)
 */
export const getMyBalance: RequestHandler = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer!.id);
    if (!customer) {
      return next(new AppError(404, "Customer not found"));
    }

    // Guard: customer must have an account
    if (!customer.account?.number) {
      return next(
        new AppError(
          400,
          "You do not have an account yet. Create one first.",
        ),
      );
    }

    // Live fetch — we never cache balance
    const result = await getBalance(customer.account.number);

    return res.json({
      accountNumber: result.accountNumber,
      balance: result.balance,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/account/name-enquiry/:accountNumber
 *
 * Return the account holder's name for any 10-digit account number.
 * No ownership check by design — this exists to look up other people's names
 * (e.g. before initiating a transfer).
 * Requires authentication.
 */
export const getNameEnquiry: RequestHandler = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;

    // Basic input sanity — 10-digit numeric
    if (!/^\d{10}$/.test(accountNumber)) {
      return next(
        new AppError(400, "Account number must be exactly 10 digits"),
      );
    }

    const result = await nameEnquiry(accountNumber);

    return res.json({
      accountNumber: result.accountNumber,
      accountName: result.accountName,
      bankCode: result.bankCode,
      bankName: result.bankName,
    });
  } catch (err) {
    next(err);
  }
};
