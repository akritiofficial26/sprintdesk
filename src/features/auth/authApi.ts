import { dummyJsonApi } from "../../lib/axios";
import type { LoginResponse, User } from "../../types";

export interface LoginPayload {
  username: string;
  password: string;
}


const ACCESS_TOKEN_TTL_MINS = Number(import.meta.env.VITE_ACCESS_TOKEN_TTL_MINS) || 30;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await dummyJsonApi.post<LoginResponse>("/auth/login", {
    username: payload.username,
    password: payload.password,
    expiresInMins: ACCESS_TOKEN_TTL_MINS,
  });
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await dummyJsonApi.get<User>("/auth/me");
  return data;
}

export async function refreshSession(refreshToken: string) {
  const { data } = await dummyJsonApi.post<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    { refreshToken, expiresInMins: 30 }
  );
  return data;
}
