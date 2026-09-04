import { Schema, model, Document } from "mongoose";

export interface KycData {
  type: "BVN" | "NIN";
  value: string;
  seededAt?: Date; // Timestamp when this KYC was seeded into NIBSS
}

export interface AccountData {
  number: string;
  bankCode: string;
  bankName: string;
  createdAt: Date;
}

export interface ICustomer extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  kyc?: KycData;
  account?: AccountData;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): any;
}

const customerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Prevent accidental exposure; use .select('+passwordHash') when needed for login
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    kyc: {
      type: {
        type: String,
        enum: ["BVN", "NIN"],
      },
      value: String,
      seededAt: Date, // Timestamp when this KYC was seeded into NIBSS
    },
    account: {
      number: String,
      bankCode: String,
      bankName: String,
      createdAt: Date,
    },
  },
  { timestamps: true },
);

customerSchema.set("toJSON", {
  transform(_doc, ret: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, __v, ...rest } = ret;
    return rest;
  },
});

export const Customer = model<ICustomer>("Customer", customerSchema);
