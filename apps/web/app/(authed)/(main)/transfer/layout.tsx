import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send money",
};

export default function TransferLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
