import { readFileSync } from "node:fs";
import { join } from "node:path";

// Matches satori's FontOptions["weight"] union.
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type LoadedFont = {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: "normal" | "italic";
};

// Bundled once (see README in this folder's parent) rather than fetched from
// Google Fonts at request time — a live fetch ties receipt generation to
// Google's CDN availability and response format on every request.
const FONTS_DIR = join(process.cwd(), "assets/fonts");

function load(file: string): Buffer {
  return readFileSync(join(FONTS_DIR, file));
}

export const receiptFonts: LoadedFont[] = [
  {
    name: "Fraunces",
    data: load("Fraunces-Regular.woff"),
    weight: 400,
    style: "normal",
  },
  {
    name: "Fraunces",
    data: load("Fraunces-Italic-500.woff"),
    weight: 500,
    style: "italic",
  },
  {
    name: "Instrument Sans",
    data: load("InstrumentSans-Regular.woff"),
    weight: 400,
    style: "normal",
  },
  {
    name: "Instrument Sans",
    data: load("InstrumentSans-SemiBold.woff"),
    weight: 600,
    style: "normal",
  },
  {
    name: "JetBrains Mono",
    data: load("JetBrainsMono-Regular.woff"),
    weight: 400,
    style: "normal",
  },
];
