import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  ownerCustomerId: Types.ObjectId;
  direction: "debit" | "credit";
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  nibssTransactionId?: string;
  initiatedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    ownerCustomerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    fromAccount: {
      type: String,
      required: true,
    },
    toAccount: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    nibssTransactionId: {
      type: String,
      index: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true },
);

// Compound index for the primary access pattern:
// "find this customer's transactions, newest first" (GET /api/transactions).
// Without it, every list query is a collection scan filtered by ownerCustomerId
// then an in-memory sort. With it, Mongo walks the index in sorted order.
transactionSchema.index({ ownerCustomerId: 1, initiatedAt: -1 });

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema,
);
