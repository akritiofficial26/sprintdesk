import { create } from "zustand";
import type { User } from "../types";

const REFRESH_TOKEN_KEY = "sprintdesk_refresh_token";
const REMEMBER_FLAG_KEY = "sprintdesk_remember_me";
const REMEMBER_EXPIRY_KEY = "sprintdesk_remember_until";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface AuthState {
  user: User | null;
  accessToken: string | null; // intentionally NOT persisted — memory only
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we validate session on app boot
  setSession: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  finishInitializing: () => void;
}

// --- "local-storage simulation" for the refresh token ---
//
// Bonus feature: "Remember me" with simulated 30-day persistence.
//   - Checked  -> refresh token lives in localStorage, alongside an expiry
//                 timestamp 30 days out. Session survives closing the browser.
//   - Unchecked -> refresh token lives in sessionStorage, so it's gone the
//                  moment the tab/browser is closed (still survives an
//                  in-tab page refresh, per the assignment's requirement).
//
// Kept isolated behind small helpers so it's easy to swap for a real
// httpOnly-cookie-based flow later without touching call sites.
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
      // 30-day remember-me window has lapsed — fall through to logged-out.
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
