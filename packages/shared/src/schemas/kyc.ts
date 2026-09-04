import { z } from "zod";

// Reusable primitives for KYC validation
const ElevenDigitId = z.string().regex(/^\d{11}$/, "Must be exactly 11 digits");
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");
const NigerianPhone = z
  .string()
  .regex(/^0\d{10}$/, "Must be 11 digits starting with 0");

// Schema for seeding (creating/registering) a BVN in NIBSS
export const SeedBvnSchema = z.object({
  bvn: ElevenDigitId,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: IsoDate,
  phone: NigerianPhone,
});
export type SeedBvnInput = z.infer<typeof SeedBvnSchema>;

// Schema for seeding (creating/registering) a NIN in NIBSS
export const SeedNinSchema = z.object({
  nin: ElevenDigitId,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: IsoDate,
});
export type SeedNinInput = z.infer<typeof SeedNinSchema>;

// Schema for creating a bank account (requires prior KYC seeding)
export const CreateAccountSchema = z.object({
  kycType: z.enum(["BVN", "NIN"], {
    errorMap: () => ({ message: "KYC type must be BVN or NIN" }),
  }),
  kycID: z.string().min(1, "KYC ID is required"),
  dob: IsoDate,
});
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

// Legacy schema names for backward compatibility during transition
export const BvnSchema = SeedBvnSchema;
export type BvnInput = SeedBvnInput;
export const NinSchema = SeedNinSchema;
export type NinInput = SeedNinInput;
