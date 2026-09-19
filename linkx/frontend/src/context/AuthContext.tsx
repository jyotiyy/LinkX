import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types";
import { authApi } from "@/services/authApi";
import { getToken, setToken as persistToken, clearToken } from "@/services/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    persistToken(token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user: newUser, token } = await authApi.register(name, email, password);
    persistToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
