export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  picture?: string;
  provider?: "google" | "email";
};
