import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../types/index.js";
import type { AuthenticatedContext } from "../types/index.js";

/**
 * Reusable authentication middleware. Verifies the Bearer token, decodes it,
 * and attaches the authenticated user's id/email to the request context so
 * downstream handlers never need to re-implement this logic.
 */
export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    const auth: AuthenticatedContext = { userId: payload.userId, email: payload.email };
    c.set("auth", auth);
  } catch {
    throw new ApiError("UNAUTHORIZED", "Invalid or expired token", 401);
  }

  await next();
}

export function getAuth(c: Context): AuthenticatedContext {
  const auth = c.get("auth") as AuthenticatedContext | undefined;
  if (!auth) {
    throw new ApiError("UNAUTHORIZED", "Not authenticated", 401);
  }
  return auth;
}
