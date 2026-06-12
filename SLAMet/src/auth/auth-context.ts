import { createContext } from "react";
import type { AuthUser } from "./types";

export type AuthContextValue = {
  user: AuthUser | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginWithGoogle: (credential: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
