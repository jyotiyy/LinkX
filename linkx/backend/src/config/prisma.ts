import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Reuse a single PrismaClient instance to avoid exhausting DB connections
// during development hot-reloads.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });

if (env.nodeEnv === "development") {
  global.__prisma = prisma;
}
