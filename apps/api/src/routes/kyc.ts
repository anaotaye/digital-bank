import { Router } from "express";
import { SeedBvnSchema, SeedNinSchema } from "@repo/shared";
import { authenticateCustomer } from "../middleware/authenticateCustomer.js";
import { validate } from "../middleware/validate.js";
import { seedBvn, seedNin } from "../controllers/kycController.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

export const kycRouter = Router();

// All KYC endpoints require an authenticated customer
kycRouter.use(authenticateCustomer);

kycRouter.post("/bvn", validate(SeedBvnSchema), seedBvn);
kycRouter.all("/bvn", methodNotAllowed(["POST"]));

kycRouter.post("/nin", validate(SeedNinSchema), seedNin);
kycRouter.all("/nin", methodNotAllowed(["POST"]));
