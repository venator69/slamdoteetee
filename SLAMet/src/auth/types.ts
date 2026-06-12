export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "email";
};

export type StoredEmailUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};
