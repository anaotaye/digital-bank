import { z } from "zod";
import { AccountNumberSchema } from "./common.js";

export const TransferRequestSchema = z.object({
  toAccountNumber: AccountNumberSchema,
  amount: z.number().positive("Amount must be greater than zero"),
});
export type TransferRequestInput = z.infer<typeof TransferRequestSchema>;
