import { Router } from "express";
import { SignupSchema, LoginSchema } from "@repo/shared";
import { validate } from "../middleware/validate.js";
import { signup, login } from "../controllers/authController.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

export const authRouter = Router();

authRouter.post("/signup", validate(SignupSchema), signup);
authRouter.all("/signup", methodNotAllowed(["POST"]));

authRouter.post("/login", validate(LoginSchema), login);
authRouter.all("/login", methodNotAllowed(["POST"]));
