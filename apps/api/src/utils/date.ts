/**
 * NIBSS's validate endpoints return dob as an ISO datetime
 * ("1990-12-10T00:00:00.000Z"), but NIBSS's createAccount endpoint
 * expects YYYY-MM-DD. This normalizes.
 */
export function toIsoDate(input: string): string {
  // Everything before the 'T' is already YYYY-MM-DD
  const datePart = input.split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Unexpected date format from NIBSS: ${input}`);
  }
  return datePart;
}
