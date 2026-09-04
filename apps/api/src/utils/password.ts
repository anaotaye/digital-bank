import bcrypt from "bcryptjs";

// bcryptjs is intentionally slow (10 rounds = ~100ms per hash).
// This makes brute-force attacks computationally expensive — a key security feature.
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
