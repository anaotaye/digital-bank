import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction",
};

export default function TransactionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
