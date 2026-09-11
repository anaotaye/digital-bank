import { ImageResponse } from "next/og";

// Next's static file-convention for apple-icon only accepts .jpg/.jpeg/.png —
// SVG is not supported there (unlike `icon`, see app-icons docs). Generating
// a PNG here keeps the same mark (gradient + rounded square + italic "A")
// without needing an external SVG→PNG step.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #D9603C 0%, #B04424 100%)",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 128,
            color: "#FDF8F3",
            lineHeight: 1,
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size },
  );
}
