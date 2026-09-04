import { Router } from "express";
import { authRouter } from "./auth.js";
import { meRouter } from "./me.js";
import { kycRouter } from "./kyc.js";
import { accountRouter } from "./account.js";
import { transferRouter } from "./transfer.js";
import { transactionsRouter } from "./transactions.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/me", meRouter);
router.use("/kyc", kycRouter);
router.use("/account", accountRouter);
router.use("/transfer", transferRouter);
router.use("/transactions", transactionsRouter);
