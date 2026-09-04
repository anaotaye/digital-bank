import { z } from "zod";

export const AccountNumberSchema = z
  .string()
  .regex(/^\d{10}$/, "Account number must be 10 digits");
