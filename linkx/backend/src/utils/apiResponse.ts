import type { Context } from "hono";
import type { ErrorCode } from "../types/index.js";

export function success<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status);
}

export function successNoContent(c: Context) {
  return c.body(null, 204);
}

export function failure(
  c: Context,
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return c.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status as any
  );
}
