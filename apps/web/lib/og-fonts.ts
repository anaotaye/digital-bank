/**
 * Font loader for `ImageResponse` routes (transaction receipts, and any
 * future opengraph/apple-icon-style generated images that want brand
 * typefaces). `next/font` only wires fonts into the React render tree —
 * routes that build an image via `ImageResponse` (satori under the hood)
 * have to supply font bytes explicitly. satori has no fallback of its own:
 * if the `fonts` array it's given ends up empty, it refuses to lay out ANY
 * text at all ("No fonts are loaded"), so this loader is best-effort per
 * font variant (one failing doesn't sink the rest) but callers still need
 * to handle the all-failed case (e.g. Google Fonts unreachable).
 *
 * Two things Google's default CSS2 response gets wrong for our purposes,
 * both worked around below:
 *  - It serves `.woff2` by default, which satori's font parser can't read —
 *    requesting with an old Chrome user-agent gets back `.woff`/`.ttf` instead.
 *  - It splits a family into multiple @font-face blocks by Unicode subset
 *    (latin, latin-ext, vietnamese, ...), and the default "latin" subset
 *    does NOT include ₦ (U+20A6) — it only goes as far as € (U+20AC would be
 *    included, ₦ isn't). Passing `&text=` asks Google to return a single
 *    @font-face subsetted to exactly the characters we list, guaranteed to
 *    include them.
 */

const OLD_CHROME_UA =
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

// Every character the receipt image ever renders: A-Z, a-z, digits, and the
// punctuation/symbols used in copy, dates, and account numbers. Recipient
// names are ordinary Latin text so this covers them too.
const RECEIPT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₦.,'’-:·%() ";

// Matches next/og's (satori's) FontOptions["weight"] union.
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
};

type FontSpec = {
  family: string;
  weight: FontWeight;
  style: "normal" | "italic";
};

async function fetchGoogleFontVariant(spec: FontSpec): Promise<LoadedFont> {
  const axisPair =
    spec.style === "italic" ? `1,${spec.weight}` : `0,${spec.weight}`;
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(spec.family)}:ital,wght@${axisPair}&text=${encodeURIComponent(RECEIPT_CHARSET)}&display=swap`,
    { headers: { "User-Agent": OLD_CHROME_UA } },
  ).then((r) => r.text());

  const match = css.match(/src: url\(([^)]+)\) format\('[^']+'\)/);
  if (!match) {
    throw new Error(
      `Could not find a ${spec.family} ${spec.style} ${spec.weight} font URL`,
    );
  }

  const data = await fetch(match[1]).then((r) => r.arrayBuffer());
  return { name: spec.family, data, weight: spec.weight, style: spec.style };
}

const RECEIPT_FONT_SPECS: FontSpec[] = [
  { family: "Fraunces", weight: 400, style: "normal" },
  { family: "Fraunces", weight: 500, style: "italic" },
  { family: "Instrument Sans", weight: 400, style: "normal" },
  { family: "Instrument Sans", weight: 600, style: "normal" },
  { family: "JetBrains Mono", weight: 400, style: "normal" },
];

// Font bytes never change between requests — memoize across invocations in
// the same server process so only the first receipt pays the Google Fonts
// round trip. A failed attempt isn't cached, so the next request retries.
let cachedFonts: Promise<LoadedFont[]> | null = null;

/**
 * Loads the Fraunces + Instrument Sans + JetBrains Mono cuts the receipt needs. Each variant
 * is fetched independently — one failing (network hiccup, Google Fonts
 * format change) doesn't take the others down. Returns `[]` only if every
 * fetch failed; callers must handle that (satori can't render text with zero
 * fonts loaded).
 */
export async function loadReceiptFonts(): Promise<LoadedFont[]> {
  if (cachedFonts) return cachedFonts;
  const promise = loadReceiptFontsUncached();
  cachedFonts = promise;
  const result = await promise;
  if (result.length === 0) cachedFonts = null; // let a full failure retry next time
  return result;
}

async function loadReceiptFontsUncached(): Promise<LoadedFont[]> {
  const settled = await Promise.allSettled(
    RECEIPT_FONT_SPECS.map(fetchGoogleFontVariant),
  );
  const loaded = settled
    .filter(
      (r): r is PromiseFulfilledResult<LoadedFont> => r.status === "fulfilled",
    )
    .map((r) => r.value);

  const failures = settled.filter((r) => r.status === "rejected");
  if (failures.length) {
    console.error(
      `loadReceiptFonts: ${failures.length}/${RECEIPT_FONT_SPECS.length} font variants failed to load`,
      failures.map((f) => (f as PromiseRejectedResult).reason),
    );
  }

  return loaded;
}
