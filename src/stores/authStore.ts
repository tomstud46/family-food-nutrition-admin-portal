import { create } from 'zustand';
import type { AuthUser, LoginResponse } from '../types/auth';
import { http } from '../api/http';

const TOKEN_KEY = 'ffn_admin_token';
const USER_KEY = 'ffn_admin_user';

function readUser(): AuthUser | null {
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as AuthUser; } catch { return null; }
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,
  clearError: () => set({ error: null }),
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await http.post<LoginResponse>('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.response?.data?.errors?.email?.[0] ?? 'Unable to sign in. Please check your credentials.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  logout: async () => {
    try { if (localStorage.getItem(TOKEN_KEY)) await http.post('/auth/logout'); } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, error: null });
    }
  },
  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await http.get<{ user: AuthUser }>('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token, user: data.user, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
