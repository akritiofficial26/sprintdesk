import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore, refreshTokenStorage } from "../store/authStore";

export const dummyJsonApi = axios.create({
  baseURL: "https://dummyjson.com",
});

export const jsonPlaceholderApi = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

dummyJsonApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

dummyJsonApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(dummyJsonApi(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = refreshTokenStorage.get();
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await axios.post("https://dummyjson.com/auth/refresh", {
        refreshToken,
        expiresInMins: 30,
      });

      useAuthStore.getState().setAccessToken(data.accessToken);
      refreshTokenStorage.set(data.refreshToken);
      resolveQueue(data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return dummyJsonApi(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
