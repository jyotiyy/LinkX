import { customAlphabet } from "nanoid";
import { prisma } from "../config/prisma.js";

// URL-safe alphabet without visually ambiguous characters (0/O, 1/l/I).
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 7;
const MAX_ATTEMPTS = 5;

const generate = customAlphabet(ALPHABET, CODE_LENGTH);

export const RESERVED_ALIASES = new Set([
  "api",
  "login",
  "register",
  "dashboard",
  "admin",
  "auth",
  "logout",
  "me",
  "urls",
  "analytics",
  "static",
  "favicon.ico",
  "health",
]);

/**
 * Generates a random short code and verifies it does not already exist in
 * the database. Retries on collision, since randomness never guarantees
 * uniqueness.
 */
export async function generateUniqueShortCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generate();
    const existing = await prisma.url.findFirst({
      where: { OR: [{ shortCode: code }, { customAlias: code }] },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Failed to generate a unique short code after multiple attempts");
}
