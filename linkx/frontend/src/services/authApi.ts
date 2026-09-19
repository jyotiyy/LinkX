import { api, toApiError } from "./api";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post("/api/auth/register", { name, email, password });
      return res.data.data as AuthResponse;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      return res.data.data as AuthResponse;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async me(): Promise<User> {
    try {
      const res = await api.get("/api/auth/me");
      return res.data.data as User;
    } catch (err) {
      throw toApiError(err);
    }
  },
};
