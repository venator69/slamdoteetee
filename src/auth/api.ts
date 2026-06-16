import type { AuthUser } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type AuthTokens = {
  access: string;
  refresh: string;
};

type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  date_joined: string;
};

type AuthResponse = {
  user: ApiUser;
  tokens: AuthTokens;
};

function mapApiUser(user: ApiUser, provider: AuthUser["provider"] = "email"): AuthUser {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    provider,
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as Record<string, unknown>;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    const firstKey = Object.keys(data)[0];
    const value = data[firstKey];

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }

    if (typeof value === "string") {
      return value;
    }
  } catch {
    // Fall through to generic message.
  }

  return "Request failed. Please try again.";
}

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await authRequest<AuthResponse>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return { user: mapApiUser(data.user, "email"), tokens: data.tokens };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await authRequest<AuthResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return { user: mapApiUser(data.user, "email"), tokens: data.tokens };
}

export async function apiGoogleLogin(
  credential: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const data = await authRequest<AuthResponse>("/api/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });

  return { user: mapApiUser(data.user, "google"), tokens: data.tokens };
}

export async function apiMe(accessToken: string): Promise<AuthUser> {
  const user = await authRequest<ApiUser>(
    "/api/auth/me/",
    { method: "GET" },
    accessToken,
  );

  return mapApiUser(user);
}

export async function apiLogout(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await authRequest<void>(
    "/api/auth/logout/",
    {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    },
    accessToken,
  );
}
