import { api } from "./api";

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  user_role: "client" | "admin";
}

export async function login(email: string, password: string): Promise<void> {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("yv_access_token", data.access_token);
}

export async function register(
  email: string,
  password: string,
  full_name: string
): Promise<void> {
  const { data } = await api.post("/auth/register", {
    email,
    password,
    full_name,
    user_role: "client",
  });
  localStorage.setItem("yv_access_token", data.access_token);
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // clear locally regardless
  }
  localStorage.removeItem("yv_access_token");
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function getGoogleOAuthUrl(): Promise<string> {
  const { data } = await api.get<{ url: string; state: string }>("/auth/google/url");
  return data.url;
}
