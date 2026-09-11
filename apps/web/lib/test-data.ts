/**
 * Random 11-digit numeric string, first digit 1-9 (never 0-padded).
 * Used for both BVN and NIN in the KYC form.
 */
export function generateBvnOrNin(): string {
  const first = Math.floor(Math.random() * 9) + 1;
  const rest = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `${first}${rest}`;
}

/**
 * Random adult DOB, aged 22-55, as YYYY-MM-DD.
 */
export function generateDob(): string {
  const now = new Date();
  const age = 22 + Math.floor(Math.random() * 34);
  const year = now.getFullYear() - age;
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Random 11-digit Nigerian mobile number.
 * Starts with 0, followed by a real MTN/Airtel/Glo/9mobile prefix, then 7 digits.
 */
export function generateNigerianPhone(): string {
  const prefixes = [
    "703",
    "706",
    "803",
    "806",
    "810",
    "813",
    "814",
    "816",
    "903",
    "906",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const rest = Array.from({ length: 7 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `0${prefix}${rest}`;
}
