import { cookies } from "next/headers";
import { ImageResponse } from "next/og";
import { loadReceiptFonts } from "@/lib/og-fonts";

// Next 16 deprecates the Edge runtime in favor of Node.js (which now handles
// streaming responses like ImageResponse fine) — the doc this route was
// built from assumed Edge; Node.js is what this Next version wants instead.
export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Transaction = {
  id: string;
  nibssTransactionId: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  from: string;
  to: string;
  recipientName?: string | null;
  initiatedAt: string;
  completedAt?: string | null;
};

const STATUS_PILL = {
  SUCCESS: { bg: "#EEF3E5", fg: "#6B8E4E", label: "Successful" },
  FAILED: { bg: "#FBE5DF", fg: "#B84A2E", label: "Failed" },
  PENDING: { bg: "#F5EFE8", fg: "#78716C", label: "Pending" },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response(null, { status: 401 });
  }

  const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
    headers: { Cookie: `token=${token}` },
  });
  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  const { transaction: tx }: { transaction: Transaction } = await res.json();

  const fonts = await loadReceiptFonts();
  if (fonts.length === 0) {
    // satori can't lay out any text at all with zero fonts loaded — surface
    // this as a clean 502 rather than the framework's generic pipe-failure 500.
    return new Response(null, { status: 502 });
  }

  const label = tx.recipientName ?? tx.to;
  const pill = STATUS_PILL[tx.status];
  const dateStr = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(tx.initiatedAt));

  const rows: { label: string; value: string }[] = [
    { label: "Date", value: dateStr },
    { label: "From", value: tx.from },
    { label: "To", value: tx.to },
  ];
  if (tx.nibssTransactionId) {
    rows.push({ label: "Reference", value: tx.nibssTransactionId });
  }

  return new ImageResponse(
    <div
      style={{
        width: 800,
        height: 1000,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FDF8F3",
        fontFamily: "Instrument Sans",
      }}
    >
      {/* 1. Header band */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: 180,
          padding: "40px 56px 44px",
          background: "linear-gradient(135deg, #D9603C 0%, #B04424 100%)",
          color: "#FDF8F3",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -70,
            right: -70,
            width: 260,
            height: 260,
            borderRadius: 130,
            background:
              "radial-gradient(circle, rgba(255,200,150,0.35) 0%, rgba(255,200,150,0) 70%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#FDF8F3",
            }}
          >
            <span
              style={{
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 34,
                color: "#C9522F",
              }}
            >
              A
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 30,
              }}
            >
              Ann&apos;s
            </span>
            <span
              style={{
                display: "flex",
                fontFamily: "Instrument Sans",
                fontSize: 20,
                opacity: 0.75,
              }}
            >
              bank
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontFamily: "Instrument Sans",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 3,
            opacity: 0.75,
            fontWeight: 600,
          }}
        >
          Transfer receipt
        </div>
      </div>

      {/* 2. Amount hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: 260,
          padding: "48px 56px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Sans",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 600,
            color: "#78716C",
          }}
        >
          {tx.status === "FAILED" ? "Attempted" : "Sent"}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
          <span
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 400,
              fontSize: 68,
              lineHeight: 1,
              color: "#C9522F",
              marginRight: 4,
              marginTop: 3,
            }}
          >
            ₦
          </span>
          <span
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 400,
              fontSize: 92,
              lineHeight: 1,
              color: "#0F0E0D",
            }}
          >
            {tx.amount.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontFamily: "Instrument Sans",
            fontSize: 24,
            color: "#44403C",
          }}
        >
          <span style={{ display: "flex", fontFamily: "Instrument Sans" }}>
            to&nbsp;
          </span>
          <span
            style={{
              display: "flex",
              fontFamily: "Instrument Sans",
              fontWeight: 600,
              color: "#0F0E0D",
            }}
          >
            {label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            padding: "9px 18px 7px",
            borderRadius: 999,
            fontFamily: "Instrument Sans",
            textTransform: "uppercase",
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1,
            letterSpacing: 0.5,
            background: pill.bg,
            color: pill.fg,
          }}
        >
          {pill.label}
        </div>
      </div>

      {/* 3. Detail grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "0 56px",
          borderTop: "1px solid #E7E5E4",
          borderBottom: "1px solid #E7E5E4",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 0",
              borderBottom: i < rows.length - 1 ? "1px solid #F5EFE8" : "none",
            }}
          >
            <span
              style={{
                display: "flex",
                fontFamily: "Instrument Sans",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontWeight: 600,
                color: "#78716C",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 500,
                color: "#44403C",
                fontFamily: "JetBrains Mono",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "auto",
          padding: "32px 56px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: 500,
            fontFamily: "Instrument Sans",
            fontSize: 14,
            lineHeight: 1.5,
            color: "#78716C",
            textAlign: "center",
          }}
        >
          A record of your transfer with Ann&apos;s Bank. Keep this for your
          records or share it with the recipient.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontFamily: "JetBrains Mono",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontWeight: 600,
            color: "#A8A29E",
          }}
        >
          annsbank.dev
        </div>
      </div>
    </div>,
    {
      width: 800,
      height: 1000,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
