export interface NibssLoginResponse {
  token: string;
  fintech: {
    name: string;
    email: string;
    bankCode: string;
    bankName: string;
  };
}

export interface NibssCreateAccountRequest {
  kycType: "bvn" | "nin";
  kycID: string;
  dob: string;
}

export interface NibssCreateAccountResponse {
  message: string;
  account: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    balance: number;
  };
}

export interface NibssNameEnquiryResponse {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

export interface NibssBalanceResponse {
  accountNumber: string;
  balance: number;
}

export interface NibssTransferRequest {
  from: string;
  to: string;
  amount: string;
}

// NIBSS transfer + TSQ responses are normalized in endpoints.ts. Their real
// shape is flat and uses different field names than every other NIBSS endpoint
// (`reference`, `senderAccount`, `receiverAccount`), so the source of truth is
// `NibssTransferResult` / `NibssTransactionStatusResult` there, not an interface
// here.

export interface NibssBvnRequest {
  bvn: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
}

export interface NibssNinRequest {
  nin: string;
  firstName: string;
  lastName: string;
  dob: string;
}

export interface NibssBvnResponse {
  message: string;
  bvn: string;
  firstName: string;
  lastName: string;
  dob: string;
}

export interface NibssNinResponse {
  message: string;
  nin: string;
  firstName: string;
  lastName: string;
  dob: string;
}

export type ValidatedIdentity = {
  firstName: string;
  lastName: string;
  dob: string; // ISO datetime as NIBSS returns it, e.g. "1990-12-10T00:00:00.000Z"
};

export interface NibssValidationResponse {
  isValid: boolean;
  message: string;
}
