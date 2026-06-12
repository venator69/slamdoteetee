import type { AuthUser, StoredEmailUser } from "./types";

const SESSION_KEY = "slamet_auth_user";
const USERS_KEY = "slamet_auth_users";

export function getSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getStoredEmailUsers(): StoredEmailUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredEmailUser[];
  } catch {
    return [];
  }
}

export function saveStoredEmailUsers(users: StoredEmailUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
