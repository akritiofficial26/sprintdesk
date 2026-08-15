import { useEffect } from "react";
import { useAuthStore, refreshTokenStorage } from "../../store/authStore";
import { fetchCurrentUser, refreshSession } from "./authApi";

export function useSessionInit() {
  const setSession = useAuthStore((s) => s.setSession);
  const finishInitializing = useAuthStore((s) => s.finishInitializing);
  const isInitializing = useAuthStore((s) => s.isInitializing);

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
  }, []);

  return { isInitializing };
}
