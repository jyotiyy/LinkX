export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedContext {
  userId: string;
  email: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "EXPIRED"
  | "INTERNAL_ERROR"
  | "RESERVED_ALIAS";

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
