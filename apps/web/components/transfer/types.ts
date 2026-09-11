export type Recipient = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName?: string;
};

export type TransferResult = {
  id: string;
  nibssTransactionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  from: string;
  to: string;
  recipientName: string;
  initiatedAt: string;
};

export type TransferStep = "recipient" | "amount" | "confirm" | "result";
