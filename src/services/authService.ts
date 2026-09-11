import { api } from "@/lib/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  const { token } = response.data;

  localStorage.setItem("auth_token", token);

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me");

  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("auth_token");
  }
}
