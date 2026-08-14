import { useEffect } from "react";
import { useAuthStore, refreshTokenStorage } from "../../store/authStore";
import { fetchCurrentUser, refreshSession } from "./authApi";

/**
 * Runs once on app boot. If a refresh token is present, exchange it for a
 * fresh access token and load the user, restoring the session after a page
 * refresh. If it fails (expired/invalid), fall through to the logged-out state.
 */
export function useSessionInit() {
  const { setSession, finishInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const refreshToken = refreshTokenStorage.get();
      if (!refreshToken) {
        finishInitializing();
        return;
      }

      try {
        const { accessToken, refreshToken: newRefreshToken } = await refreshSession(refreshToken);
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await fetchCurrentUser();
        if (!cancelled) {
          setSession(user, accessToken, newRefreshToken);
        }
      } catch {
        useAuthStore.getState().clearSession();
      } finally {
        if (!cancelled) finishInitializing();
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isInitializing };
}
