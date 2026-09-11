import { RequestHandler } from "express";
import { Customer, Transaction } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { transfer } from "../services/nibss/endpoints.js";

/**
 * POST /api/transfer
 *
 * Initiate a money transfer from the authenticated customer's account to any
 * 10-digit account number. Body validated upstream by validate(TransferRequestSchema).
 * Requires authentication.
 *
 * Design:
 * - We record a PENDING transaction BEFORE calling NIBSS, so we keep a durable
 *   record of intent even if the NIBSS call hangs or the process crashes.
 * - The try/catch around the NIBSS call converts any failure into a saved FAILED
 *   transaction, so the customer always has a record of the attempt.
 * - We do NOT pre-check balance (from our DB or NIBSS) — NIBSS is the source of
 *   truth and pre-checking only introduces a race condition. Insufficient funds
 *   come back as a 4xx from NIBSS and bubble up.
 */
export const initiateTransfer: RequestHandler = async (req, res, next) => {
  try {
    const { toAccountNumber, amount, recipientName, recipientBankCode } =
      req.body as {
        toAccountNumber: string;
        amount: number;
        recipientName: string;
        recipientBankCode?: string;
      };

    const customer = await Customer.findById(req.customer!.id);
    if (!customer) {
      return next(new AppError(404, "Customer not found"));
    }

    // Guard: sender must have an account
    if (!customer.account?.number) {
      return next(
        new AppError(
          400,
          "You do not have an account yet. Create one first.",
        ),
      );
    }

    const fromAccountNumber = customer.account.number;

    // Block self-transfer — no legitimate reason to send money to yourself,
    // usually indicates a bug or user mistake. Rejected BEFORE we save anything.
    if (fromAccountNumber === toAccountNumber) {
      return next(
        new AppError(400, "You cannot transfer to your own account"),
      );
    }

    // Record a PENDING transaction FIRST — durable record of intent.
    const localTx = await Transaction.create({
      ownerCustomerId: customer._id,
      direction: "debit",
      fromAccount: fromAccountNumber,
      toAccount: toAccountNumber,
      recipientName,
      recipientBankCode,
      amount,
      status: "PENDING",
      initiatedAt: new Date(),
    });

    try {
      const nibssResult = await transfer({
        from: fromAccountNumber,
        to: toAccountNumber,
        amount: String(amount), // NIBSS wants a string
      });

      // Persist the outcome
      localTx.status = normalizeStatus(nibssResult.status);
      localTx.nibssTransactionId = nibssResult.transactionId;
      localTx.completedAt = new Date();
      await localTx.save();

      return res.status(201).json({
        message: "Transfer initiated",
        transaction: {
          id: localTx._id,
          nibssTransactionId: nibssResult.transactionId,
          status: localTx.status,
          amount: nibssResult.amount,
          from: nibssResult.from,
          to: nibssResult.to,
          recipientName: localTx.recipientName,
          recipientBankCode: localTx.recipientBankCode,
          initiatedAt: localTx.initiatedAt,
        },
      });
    } catch (err) {
      // NIBSS rejected or errored. Mark our local record as failed and rethrow.
      localTx.status = "FAILED";
      localTx.completedAt = new Date();
      await localTx.save();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// --- helpers ---

function normalizeStatus(s: string): "PENDING" | "SUCCESS" | "FAILED" {
  const upper = s?.toUpperCase();
  if (upper === "SUCCESS" || upper === "FAILED" || upper === "PENDING") {
    return upper;
  }
  // Anything unexpected we treat as PENDING so it gets re-checked next TSQ.
  return "PENDING";
}
