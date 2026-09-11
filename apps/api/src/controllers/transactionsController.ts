import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Transaction } from "../models/index.js";
import type { ITransaction } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { getTransactionStatus } from "../services/nibss/endpoints.js";

/**
 * Shared response formatter — keeps the single-transaction and list responses
 * identical in shape. `tx` may be a hydrated doc or a `.lean()` plain object.
 */
function formatTransaction(tx: any) {
  return {
    id: tx._id,
    nibssTransactionId: tx.nibssTransactionId ?? null,
    status: tx.status,
    amount: tx.amount,
    from: tx.fromAccount,
    to: tx.toAccount,
    recipientName: tx.recipientName ?? null,
    recipientBankCode: tx.recipientBankCode ?? null,
    initiatedAt: tx.initiatedAt,
    completedAt: tx.completedAt ?? null,
  };
}

function normalizeStatus(s: string): "PENDING" | "SUCCESS" | "FAILED" {
  const upper = s?.toUpperCase();
  if (upper === "SUCCESS" || upper === "FAILED" || upper === "PENDING") {
    return upper;
  }
  return "PENDING";
}

/**
 * GET /api/transactions
 *
 * List the authenticated customer's transactions, newest first. Supports
 * ?page, ?limit (max 100), and ?status — all validated/coerced upstream by
 * validateQuery(TransactionListQuerySchema).
 * Requires authentication.
 *
 * Data isolation: every query on this collection MUST filter by
 * ownerCustomerId. No exceptions. `total` counts only this customer's rows.
 */
export const listTransactions: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query as unknown as {
      page: number;
      limit: number;
      status?: "PENDING" | "SUCCESS" | "FAILED";
    };

    // THE data isolation filter. Nothing queries this collection without it.
    const filter: Record<string, unknown> = {
      ownerCustomerId: req.customer!.id,
    };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Page + total count in parallel.
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ initiatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.json({
      transactions: transactions.map(formatTransaction),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:transactionId
 *
 * Return a single transaction owned by the authenticated customer, refreshing
 * its status from NIBSS on every call. Accepts either our internal Mongo _id or
 * the NIBSS transactionId (the `reference` value).
 * Requires authentication.
 *
 * Security: the ownership check lives IN the query (ownerCustomerId). A
 * transaction that belongs to someone else returns null → 404, identical to a
 * transaction that doesn't exist. We never leak the difference.
 */
export const getTransactionById: RequestHandler = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const ownerCustomerId = req.customer!.id;

    // Try our internal _id first (only if it's a valid ObjectId — otherwise
    // Mongoose would cast-error or match unpredictably).
    let localTx: ITransaction | null = null;
    if (mongoose.isValidObjectId(transactionId)) {
      localTx = await Transaction.findOne({
        _id: transactionId,
        ownerCustomerId,
      });
    }

    // Fall back to the NIBSS transactionId.
    if (!localTx) {
      localTx = await Transaction.findOne({
        nibssTransactionId: transactionId,
        ownerCustomerId,
      });
    }

    if (!localTx) {
      return next(new AppError(404, "Transaction not found"));
    }

    // Fresh status from NIBSS — only if we have a nibssTransactionId (a FAILED
    // tx that never reached NIBSS won't have one). Degrade gracefully if down.
    let latestStatus = localTx.status;
    let nibssPayload: unknown = null;

    if (localTx.nibssTransactionId) {
      try {
        const nibssResult = await getTransactionStatus(
          localTx.nibssTransactionId,
        );
        latestStatus = normalizeStatus(nibssResult.status);
        nibssPayload = nibssResult;

        if (latestStatus !== localTx.status) {
          localTx.status = latestStatus;
          if (latestStatus === "SUCCESS" || latestStatus === "FAILED") {
            localTx.completedAt = new Date();
          }
          await localTx.save();
        }
      } catch {
        // NIBSS TSQ unreachable — stale data beats erroring the endpoint.
      }
    }

    return res.json({
      transaction: {
        ...formatTransaction(localTx),
        status: latestStatus,
        nibss: nibssPayload,
      },
    });
  } catch (err) {
    next(err);
  }
};
