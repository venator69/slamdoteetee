import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { userFromGoogleCredential } from "./google";
import {
  getSessionUser,
  getStoredEmailUsers,
  hashPassword,
  saveStoredEmailUsers,
  setSessionUser,
} from "./storage";
import type { AuthUser } from "./types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSessionUser());

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    setSessionUser(nextUser);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const users = getStoredEmailUsers();
      const account = users.find((entry) => entry.email === normalizedEmail);

      if (!account) {
        throw new Error("No account found for that email.");
      }

      const passwordHash = await hashPassword(password);
      if (account.passwordHash !== passwordHash) {
        throw new Error("Incorrect password.");
      }

      persistUser({
        id: account.id,
        email: account.email,
        name: account.name,
        provider: "email",
      });
    },
    [persistUser],
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Name is required.");
      }

      const users = getStoredEmailUsers();
      if (users.some((entry) => entry.email === normalizedEmail)) {
        throw new Error("An account with this email already exists.");
      }

      const passwordHash = await hashPassword(password);
      const account = {
        id: `email:${crypto.randomUUID()}`,
        email: normalizedEmail,
        name: trimmedName,
        passwordHash,
      };

      saveStoredEmailUsers([...users, account]);
      persistUser({
        id: account.id,
        email: account.email,
        name: account.name,
        provider: "email",
      });
    },
    [persistUser],
  );

  const loginWithGoogle = useCallback(
    (credential: string) => {
      persistUser(userFromGoogleCredential(credential));
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
    }),
    [user, loginWithEmail, registerWithEmail, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
