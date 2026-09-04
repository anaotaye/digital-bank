import { z } from "zod";

export const TransactionListQuerySchema = z.object({
  // z.coerce is important — query params arrive as strings from Express
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
});
export type TransactionListQuery = z.infer<typeof TransactionListQuerySchema>;
