import { Router } from "express";
import { TransferRequestSchema } from "@repo/shared";
import { authenticateCustomer } from "../middleware/authenticateCustomer.js";
import { validate } from "../middleware/validate.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { initiateTransfer } from "../controllers/transferController.js";

export const transferRouter = Router();

// All transfer endpoints require an authenticated customer
transferRouter.use(authenticateCustomer);

// POST /api/transfer — initiate a transfer from the customer's account
// Body: { toAccountNumber: string(10 digits), amount: number > 0 }
transferRouter.post("/", validate(TransferRequestSchema), initiateTransfer);
transferRouter.all("/", methodNotAllowed(["POST"]));
