import type { AuthUser } from "./types";

type GoogleJwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export function userFromGoogleCredential(credential: string): AuthUser {
  const payloadSegment = credential.split(".")[1];
  if (!payloadSegment) {
    throw new Error("Invalid Google credential.");
  }

  const payload = JSON.parse(atob(payloadSegment)) as GoogleJwtPayload;

  if (!payload.sub || !payload.email) {
    throw new Error("Google account is missing required profile fields.");
  }

  return {
    id: `google:${payload.sub}`,
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
    provider: "google",
  };
}
