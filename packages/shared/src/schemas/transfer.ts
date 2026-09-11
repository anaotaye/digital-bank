import { z } from "zod";
import { AccountNumberSchema } from "./common.js";

export const TransferRequestSchema = z.object({
  toAccountNumber: AccountNumberSchema,
  amount: z.number().positive("Amount must be greater than zero"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientBankCode: z.string().optional(),
});
export type TransferRequestInput = z.infer<typeof TransferRequestSchema>;
