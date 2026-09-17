import { Router } from "express";
import { TransactionListQuerySchema } from "@repo/shared";
import { authenticateCustomer } from "../middleware/authenticateCustomer.js";
import { validateQuery } from "../middleware/validate.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import {
  listTransactions,
  getTransactionById,
  getTransactionReceipt,
} from "../controllers/transactionsController.js";

export const transactionsRouter = Router();

// All transaction endpoints require an authenticated customer
transactionsRouter.use(authenticateCustomer);

// GET /api/transactions — list the customer's own transactions
// Query: ?page (default 1), ?limit (default 20, max 100), ?status (PENDING|SUCCESS|FAILED)
transactionsRouter.get(
  "/",
  validateQuery(TransactionListQuerySchema),
  listTransactions,
);
transactionsRouter.all("/", methodNotAllowed(["GET"]));

// GET /api/transactions/:transactionId — one transaction the customer owns,
// with a fresh NIBSS status. Accepts our internal Mongo _id OR the NIBSS reference.
transactionsRouter.get("/:transactionId", getTransactionById);
transactionsRouter.all("/:transactionId", methodNotAllowed(["GET"]));

// GET /api/transactions/:transactionId/receipt — the transfer receipt as a PNG.
transactionsRouter.get("/:transactionId/receipt", getTransactionReceipt);
transactionsRouter.all("/:transactionId/receipt", methodNotAllowed(["GET"]));
