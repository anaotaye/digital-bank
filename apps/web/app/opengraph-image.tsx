import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Bundled locally rather than fetched from Google Fonts at request time —
// that CSS response is scraped by format string and format/subset URLs
// change without notice, so a live fetch is one Google-side change away
// from breaking this route (and Next 16 deprecates the Edge runtime this
// route used to run on anyway — see the same note on
// app/api/receipt/[id]/route.tsx).
export const runtime = "nodejs";
export const alt = "Ann's Bank — Banking made kind.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const frauncesItalic = await readFile(
  join(process.cwd(), "assets/fonts/Fraunces-Italic-500.woff"),
);

const pills = ["Next.js", "TypeScript", "Express", "MongoDB", "NIBSS API"];

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "80px 100px",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#FDF8F3",
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(201, 82, 47, 0.08), transparent 30%), radial-gradient(circle at 85% 85%, rgba(183, 134, 60, 0.06), transparent 32%)",
        color: "#1D1A17",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            width: 88,
            height: 88,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "linear-gradient(135deg, #D9603C, #B04424)",
            color: "#FFF8ED",
            fontFamily: "Fraunces",
            fontSize: 68,
            fontStyle: "italic",
            fontWeight: 500,
            fontVariationSettings: "'SOFT' 100",
          }}
        >
          A
        </div>
        <div
          style={{
            display: "flex",
            color: "#C9522F",
            fontFamily: "monospace",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 4,
          }}
        >
          ANN&apos;S BANK
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 24,
            fontFamily: "Fraunces",
            fontSize: 108,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ display: "flex", color: "#1D1A17" }}>
            Banking made
          </span>
          <span
            style={{ display: "flex", color: "#C9522F", fontStyle: "italic" }}
          >
            kind.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 900,
            color: "#756E68",
            fontFamily: "system-ui",
            fontSize: 26,
            lineHeight: 1.35,
          }}
        >
          A fullstack digital banking app simulating a Nigerian fintech, built
          on the NIBSS by Phoenix API.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {pills.map((pill) => (
          <div
            key={pill}
            style={{
              display: "flex",
              padding: "8px 16px",
              border: "1px solid #E5DED7",
              borderRadius: 999,
              backgroundColor: "#FFF8ED",
              color: "#756E68",
              fontFamily: "system-ui",
              fontSize: 16,
            }}
          >
            {pill}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Fraunces",
          data: frauncesItalic,
          style: "italic",
          weight: 500,
        },
      ],
    },
  );
}
