import { Router } from "express";
import { authenticateCustomer } from "../middleware/authenticateCustomer.js";
import { getMe } from "../controllers/meController.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

export const meRouter = Router();

meRouter.get("/", authenticateCustomer, getMe);
meRouter.all("/", methodNotAllowed(["GET"])); // ← catches other methods on '/'
