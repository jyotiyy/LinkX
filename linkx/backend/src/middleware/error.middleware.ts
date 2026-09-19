import type { Context } from "hono";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../types/index.js";
import { failure } from "../utils/apiResponse.js";

/**
 * Centralized error handler registered via `app.onError`. Converts any
 * thrown error (validation, known ApiError, Prisma error, or unexpected)
 * into the application's consistent { success: false, error } response
 * shape.
 */
export function errorHandler(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return failure(c, err.code, err.message, err.status, err.details);
  }

  if (err instanceof ZodError) {
    return failure(c, "VALIDATION_ERROR", "Invalid request data", 422, err.flatten());
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return failure(c, "CONFLICT", "A resource with this value already exists", 409, {
        target: err.meta?.target,
      });
    }
    if (err.code === "P2025") {
      return failure(c, "NOT_FOUND", "Resource not found", 404);
    }
    console.error("Prisma error:", err.code, err.message);
    return failure(c, "INTERNAL_ERROR", "Database error", 500);
  }

  console.error("Unexpected error:", err);
  return failure(c, "INTERNAL_ERROR", "An unexpected error occurred", 500);
}
