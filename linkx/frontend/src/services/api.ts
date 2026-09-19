import axios, { AxiosError } from "axios";
import type { ApiErrorShape } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "linkx_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Normalizes any Axios error into the backend's { code, message } shape. */
export function toApiError(err: unknown): ApiClientError {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ error?: ApiErrorShape }>;
    const payload = axiosErr.response?.data?.error;
    if (payload) {
      return new ApiClientError(payload.message, payload.code, axiosErr.response?.status ?? 500, payload.details);
    }
    return new ApiClientError(axiosErr.message || "Network error", "NETWORK_ERROR", axiosErr.response?.status ?? 0);
  }
  return new ApiClientError("Unexpected error", "UNKNOWN", 500);
}

export { API_URL };
