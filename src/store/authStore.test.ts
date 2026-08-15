import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore, refreshTokenStorage } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
    });
  });

  it("starts logged out", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("setSession logs the user in and persists the refresh token", () => {
    const user = { id: 1, username: "emilys", email: "emily@x.com", firstName: "Emily", lastName: "S", image: "" };
    useAuthStore.getState().setSession(user, "access-123", "refresh-456");

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("access-123");
    expect(refreshTokenStorage.get()).toBe("refresh-456");
  });

  it("clearSession logs the user out and clears the refresh token", () => {
    useAuthStore.getState().setSession(
      { id: 1, username: "emilys", email: "e@x.com", firstName: "E", lastName: "S", image: "" },
      "access-123",
      "refresh-456"
    );

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(refreshTokenStorage.get()).toBeNull();
  });

  it("without Remember me, stores the refresh token in sessionStorage only", () => {
    const user = { id: 1, username: "emilys", email: "e@x.com", firstName: "E", lastName: "S", image: "" };
    useAuthStore.getState().setSession(user, "access-1", "refresh-1", false);

    expect(sessionStorage.getItem("sprintdesk_refresh_token")).toBe("refresh-1");
    expect(localStorage.getItem("sprintdesk_refresh_token")).toBeNull();
    expect(refreshTokenStorage.get()).toBe("refresh-1");
  });

  it("with Remember me, stores the refresh token + a 30-day expiry in localStorage", () => {
    const user = { id: 1, username: "emilys", email: "e@x.com", firstName: "E", lastName: "S", image: "" };
    useAuthStore.getState().setSession(user, "access-1", "refresh-1", true);

    expect(localStorage.getItem("sprintdesk_refresh_token")).toBe("refresh-1");
    expect(localStorage.getItem("sprintdesk_remember_me")).toBe("1");
    const expiry = Number(localStorage.getItem("sprintdesk_remember_until"));
    expect(expiry).toBeGreaterThan(Date.now());
    expect(refreshTokenStorage.get()).toBe("refresh-1");
  });

  it("rejects a Remember-me refresh token once the 30-day window has lapsed", () => {
    localStorage.setItem("sprintdesk_remember_me", "1");
    localStorage.setItem("sprintdesk_refresh_token", "stale-token");
    localStorage.setItem("sprintdesk_remember_until", String(Date.now() - 1000));

    expect(refreshTokenStorage.get()).toBeNull();
    expect(localStorage.getItem("sprintdesk_refresh_token")).toBeNull();
  });
});
