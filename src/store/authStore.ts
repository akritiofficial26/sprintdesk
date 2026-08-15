import { create } from "zustand";
import type { User } from "../types";

const REFRESH_TOKEN_KEY = "sprintdesk_refresh_token";
const REMEMBER_FLAG_KEY = "sprintdesk_remember_me";
const REMEMBER_EXPIRY_KEY = "sprintdesk_remember_until";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  finishInitializing: () => void;
}

function isRemembering(): boolean {
  return localStorage.getItem(REMEMBER_FLAG_KEY) === "1";
}

export const refreshTokenStorage = {
  set(token: string, rememberMe?: boolean): void {
    const remember = rememberMe ?? isRemembering();
    if (remember) {
      localStorage.setItem(REMEMBER_FLAG_KEY, "1");
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_EXPIRY_KEY, String(Date.now() + THIRTY_DAYS_MS));
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_FLAG_KEY);
      localStorage.removeItem(REMEMBER_EXPIRY_KEY);
    }
  },
  get(): string | null {
    if (isRemembering()) {
      const expiry = Number(localStorage.getItem(REMEMBER_EXPIRY_KEY) ?? 0);
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (token && Date.now() < expiry) return token;
      refreshTokenStorage.clear();
      return null;
    }
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  clear(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_FLAG_KEY);
    localStorage.removeItem(REMEMBER_EXPIRY_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, accessToken, refreshToken, rememberMe) => {
    refreshTokenStorage.set(refreshToken, rememberMe);
    set({ user, accessToken, isAuthenticated: true });
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  clearSession: () => {
    refreshTokenStorage.clear();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  finishInitializing: () => set({ isInitializing: false }),
}));
