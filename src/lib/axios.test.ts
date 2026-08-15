import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios, { type AxiosAdapter, type AxiosResponse } from "axios";
import { dummyJsonApi } from "./axios";
import { useAuthStore, refreshTokenStorage } from "../store/authStore";

interface MockResult {
  status: number;
  data: unknown;
}


function installMockAdapter(script: Record<string, MockResult[]>) {
  const calls: Record<string, number> = {};

  const adapter: AxiosAdapter = async (config) => {
    const url = config.baseURL ? `${config.baseURL}${config.url}` : (config.url as string);
    const queue = script[url];
    if (!queue || queue.length === 0) {
      throw new Error(`No mock response queued for ${url}`);
    }

    calls[url] = (calls[url] ?? 0) + 1;
    const next = queue.shift()!;
    const response: AxiosResponse = { data: next.data, status: next.status, statusText: "", headers: {}, config };

    if (next.status >= 400) {
      const error = new Error("Request failed") as Error & { config: unknown; response: unknown; isAxiosError: true };
      error.config = config;
      error.response = response;
      error.isAxiosError = true;
      throw error;
    }

    return response;
  };

  dummyJsonApi.defaults.adapter = adapter;
  axios.defaults.adapter = adapter;
  return calls;
}

const testUser = { id: 1, username: "emilys", email: "e@x.com", firstName: "E", lastName: "S", image: "" };

describe("dummyJsonApi auth interceptor", () => {
  const originalInstanceAdapter = dummyJsonApi.defaults.adapter;
  const originalGlobalAdapter = axios.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
  });

  afterEach(() => {
    dummyJsonApi.defaults.adapter = originalInstanceAdapter;
    axios.defaults.adapter = originalGlobalAdapter;
  });

  it("refreshes the access token on a 401 and retries the original request", async () => {
    useAuthStore.getState().setSession(testUser, "expired-token", "valid-refresh-token");

    const calls = installMockAdapter({
      "https://dummyjson.com/protected": [
        { status: 401, data: { message: "expired" } },
        { status: 200, data: { ok: true } },
      ],
      "https://dummyjson.com/auth/refresh": [
        { status: 200, data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" } },
      ],
    });

    const response = await dummyJsonApi.get("/protected");

    expect(response.data).toEqual({ ok: true });
    expect(calls["https://dummyjson.com/protected"]).toBe(2);
    expect(calls["https://dummyjson.com/auth/refresh"]).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe("new-access-token");
    expect(refreshTokenStorage.get()).toBe("new-refresh-token");
  });

  it("only refreshes once for concurrent requests that 401 together", async () => {
    useAuthStore.getState().setSession(testUser, "expired-token", "valid-refresh-token");

    const calls = installMockAdapter({
      "https://dummyjson.com/a": [
        { status: 401, data: {} },
        { status: 200, data: { from: "a" } },
      ],
      "https://dummyjson.com/b": [
        { status: 401, data: {} },
        { status: 200, data: { from: "b" } },
      ],
      "https://dummyjson.com/auth/refresh": [
        { status: 200, data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" } },
      ],
    });

    const [a, b] = await Promise.all([dummyJsonApi.get("/a"), dummyJsonApi.get("/b")]);

    expect(a.data).toEqual({ from: "a" });
    expect(b.data).toEqual({ from: "b" });
    expect(calls["https://dummyjson.com/auth/refresh"]).toBe(1);
  });

  it("clears the session when the refresh call itself fails", async () => {
    useAuthStore.getState().setSession(testUser, "expired-token", "invalid-refresh-token");

    installMockAdapter({
      "https://dummyjson.com/protected": [{ status: 401, data: {} }],
      "https://dummyjson.com/auth/refresh": [{ status: 401, data: { message: "invalid refresh token" } }],
    });

    await expect(dummyJsonApi.get("/protected")).rejects.toBeTruthy();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(refreshTokenStorage.get()).toBeNull();
  });
});
