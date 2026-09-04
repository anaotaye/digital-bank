import { Router } from "express";
import { authenticateCustomer } from "../middleware/authenticateCustomer.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import {
  createAccount,
  getMyBalance,
  getNameEnquiry,
} from "../controllers/accountController.js";

export const accountRouter = Router();

// All account endpoints require an authenticated customer
accountRouter.use(authenticateCustomer);

// POST /api/account — create the customer's single bank account
// Body: none (all data from customer's KYC record)
// Response: 201 with { message, account: { number, bankCode, bankName, balance, createdAt } }
accountRouter.post("/", createAccount);
accountRouter.all("/", methodNotAllowed(["POST"])); // ← catches other methods on '/'

// GET /api/account/balance — the customer's own balance, fetched live from NIBSS
accountRouter.get("/balance", getMyBalance);
accountRouter.all("/balance", methodNotAllowed(["GET"]));

// GET /api/account/name-enquiry/:accountNumber — look up any account's holder name
accountRouter.get("/name-enquiry/:accountNumber", getNameEnquiry);
accountRouter.all("/name-enquiry/:accountNumber", methodNotAllowed(["GET"]));

// Transfers and transactions will be added in later chunks
