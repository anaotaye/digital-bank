import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth";
import { SwrProvider } from "@/lib/swr-config";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ann's Bank",
    template: "%s · Ann's Bank",
  },
  description:
    "Banking made kind. A fullstack digital banking app simulating a Nigerian fintech, built on the NIBSS by Phoenix API.",
  applicationName: "Ann's Bank",
  authors: [{ name: "Anastasia Otaye" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "Ann's Bank",
    title: "Ann's Bank",
    description: "Banking made kind.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ann's Bank",
    description: "Banking made kind.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AuthProvider>
          <SwrProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                classNames: {
                  toast:
                    "font-sans bg-paper border border-ink-200 text-ink-900 shadow-warm",
                },
              }}
            />
          </SwrProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
