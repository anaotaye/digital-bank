import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { nibssClient } from "./client.js";
import {
  NibssBvnRequest,
  NibssNinRequest,
  NibssBvnResponse,
  NibssNinResponse,
  NibssValidationResponse,
  //   NibssValidateBvnResponse,
  //   NibssValidateNinResponse,
  NibssCreateAccountRequest,
  NibssCreateAccountResponse,
  NibssTransferRequest,
  ValidatedIdentity,
} from "./types.js";

export async function insertBvn(
  payload: NibssBvnRequest,
): Promise<NibssBvnResponse> {
  const res = await nibssClient.post<NibssBvnResponse>(
    "/api/insertBvn",
    payload,
  );
  return res.data;
}

export async function insertNin(
  payload: NibssNinRequest,
): Promise<NibssNinResponse> {
  const res = await nibssClient.post<NibssNinResponse>(
    "/api/insertNin",
    payload,
  );

  return res.data;
}

export async function validateBvn(bvn: string): Promise<ValidatedIdentity> {
  const res = await nibssClient.post("/api/validateBvn", { bvn });
  const body = res.data;

  // NIBSS returns 200 with { success: false } when the BVN isn't in its store
  if (body?.success === false) {
    throw new AppError(
      400,
      `BVN validation failed: ${body.message ?? "not found"}`,
    );
  }

  // Success shape: { success: true, message, data: { firstName, lastName, dob, ... } }
  const identity = body?.data;
  if (!identity?.firstName || !identity?.dob) {
    throw new AppError(502, "NIBSS validateBvn returned unexpected shape", {
      got: body,
    });
  }

  return {
    firstName: identity.firstName,
    lastName: identity.lastName,
    dob: identity.dob,
  };
}

export async function validateNin(nin: string): Promise<ValidatedIdentity> {
  const res = await nibssClient.post("/api/validateNin", { nin });
  const body = res.data;

  // NIN uses the same failure pattern (assumption — will need adjusting if wrong)
  if (body?.success === false) {
    throw new AppError(
      400,
      `NIN validation failed: ${body.message ?? "not found"}`,
    );
  }

  // Success shape: { message, response: { firstName, lastName, dob, ... } }
  const identity = body?.response;
  if (!identity?.firstName || !identity?.dob) {
    throw new AppError(502, "NIBSS validateNin returned unexpected shape", {
      got: body,
    });
  }

  return {
    firstName: identity.firstName,
    lastName: identity.lastName,
    dob: identity.dob,
  };
}

export async function createNibssAccount(
  payload: NibssCreateAccountRequest,
): Promise<NibssCreateAccountResponse> {
  const res = await nibssClient.post<NibssCreateAccountResponse>(
    "/api/account/create",
    payload,
  );
  return res.data;
}

export type NibssBalanceResult = {
  accountNumber: string;
  balance: number;
};

export async function getBalance(
  accountNumber: string,
): Promise<NibssBalanceResult> {
  const res = await nibssClient.get(`/api/account/balance/${accountNumber}`);
  const body = res.data;

  if (env.NODE_ENV === "development") {
    console.log("[NIBSS getBalance] body:", JSON.stringify(body, null, 2));
  }

  // NIBSS pattern: some endpoints wrap under `data`, some under `response`,
  // some flat. Try each in turn, then fall back to the flat body.
  const candidate = body?.data ?? body?.response ?? body;
  if (
    typeof candidate?.balance !== "number" ||
    !candidate?.accountNumber
  ) {
    throw new AppError(502, "NIBSS getBalance returned unexpected shape", {
      got: body,
    });
  }

  return {
    accountNumber: candidate.accountNumber,
    balance: candidate.balance,
  };
}

export type NibssNameEnquiryResult = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName?: string; // optional — NIBSS often omits this
};

export async function nameEnquiry(
  accountNumber: string,
): Promise<NibssNameEnquiryResult> {
  const res = await nibssClient.get(
    `/api/account/name-enquiry/${accountNumber}`,
  );
  const body = res.data;

  if (env.NODE_ENV === "development") {
    console.log("[NIBSS nameEnquiry] body:", JSON.stringify(body, null, 2));
  }

  // Same defensive unwrap as getBalance.
  const candidate = body?.data ?? body?.response ?? body;
  if (!candidate?.accountName || !candidate?.accountNumber) {
    throw new AppError(502, "NIBSS nameEnquiry returned unexpected shape", {
      got: body,
    });
  }

  return {
    accountNumber: candidate.accountNumber,
    accountName: candidate.accountName,
    bankCode: candidate.bankCode ?? "unknown",
    bankName: candidate.bankName, // undefined when NIBSS doesn't send it
  };
}

export async function getAllAccounts(): Promise<{ accountNumber: string }[]> {
  const res =
    await nibssClient.get<{ accountNumber: string }[]>("/api/accounts");
  return res.data;
}

export type NibssTransferResult = {
  transactionId: string;
  status: string; // 'SUCCESS' | 'PENDING' | 'FAILED' — treat as string, don't assume
  amount: number;
  from: string;
  to: string;
  message?: string;
};

/**
 * Confirmed NIBSS transfer/TSQ shape (flat, no wrapper):
 *   { reference, senderAccount, receiverAccount, amount, status,
 *     _id, createdAt, updatedAt }
 * Field names differ from every other NIBSS endpoint, so we normalize here.
 * The `?? transactionId/from/to` fallbacks stay in case TSQ echoes the older
 * names — harmless, and cheap insurance.
 */
function normalizeNibssTx(candidate: any) {
  return {
    transactionId: candidate?.reference ?? candidate?.transactionId,
    status: candidate?.status,
    amount: Number(candidate?.amount),
    from: candidate?.senderAccount ?? candidate?.from,
    to: candidate?.receiverAccount ?? candidate?.to,
    timestamp:
      candidate?.timestamp ?? candidate?.updatedAt ?? candidate?.createdAt,
  };
}

export async function transfer(
  payload: NibssTransferRequest,
): Promise<NibssTransferResult> {
  const res = await nibssClient.post("/api/transfer", payload);
  const body = res.data;

  if (env.NODE_ENV === "development") {
    console.log("[NIBSS transfer] body:", JSON.stringify(body, null, 2));
  }

  const candidate = body?.data ?? body?.response ?? body;
  const tx = normalizeNibssTx(candidate);

  if (!tx.transactionId || !tx.status) {
    throw new AppError(502, "NIBSS transfer returned unexpected shape", {
      got: body,
    });
  }

  return {
    transactionId: tx.transactionId,
    status: tx.status,
    amount: tx.amount,
    from: tx.from,
    to: tx.to,
    message: body?.message ?? candidate?.message,
  };
}

export type NibssTransactionStatusResult = {
  transactionId: string;
  status: string;
  amount: number;
  from: string;
  to: string;
  timestamp?: string;
};

export async function getTransactionStatus(
  transactionId: string,
): Promise<NibssTransactionStatusResult> {
  const res = await nibssClient.get(`/api/transaction/${transactionId}`);
  const body = res.data;

  if (env.NODE_ENV === "development") {
    console.log(
      "[NIBSS getTransactionStatus] body:",
      JSON.stringify(body, null, 2),
    );
  }

  const candidate = body?.data ?? body?.response ?? body;
  const tx = normalizeNibssTx(candidate);

  if (!tx.transactionId || !tx.status) {
    throw new AppError(502, "NIBSS TSQ returned unexpected shape", {
      got: body,
    });
  }

  return {
    transactionId: tx.transactionId,
    status: tx.status,
    amount: tx.amount,
    from: tx.from,
    to: tx.to,
    timestamp: tx.timestamp,
  };
}
