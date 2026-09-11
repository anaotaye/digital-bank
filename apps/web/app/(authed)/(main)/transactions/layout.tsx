import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity",
};

export default function TransactionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
