import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  apiGoogleLogin,
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
} from "./api";
import { AuthContext } from "./auth-context";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from "./storage";
import type { AuthUser } from "./types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const persistSession = useCallback(
    (nextUser: AuthUser, tokens: { access: string; refresh: string }) => {
      saveAuthSession(nextUser, tokens);
      setUser(nextUser);
    },
    [],
  );

  const clearSession = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        clearAuthSession();
        if (!cancelled) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const currentUser = await apiMe(accessToken);
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const { user: nextUser, tokens } = await apiLogin(email, password);
      persistSession(nextUser, tokens);
    },
    [persistSession],
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: nextUser, tokens } = await apiRegister(name, email, password);
      persistSession(nextUser, tokens);
    },
    [persistSession],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const { user: nextUser, tokens } = await apiGoogleLogin(credential);
      persistSession(nextUser, tokens);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      try {
        await apiLogout(accessToken, refreshToken);
      } catch {
        // Clear local session even if server logout fails.
      }
    }

    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
    }),
    [
      user,
      isInitializing,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
