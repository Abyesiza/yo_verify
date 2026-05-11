import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Refresh-token lock ────────────────────────────────────────────────────────
// Only one refresh is allowed in-flight at a time. Any other 401 that arrives
// while the refresh is running is queued and replayed after the refresh settles.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailureCallbacks: Array<() => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}
function subscribeToRefreshFailure(cb: () => void) {
  refreshFailureCallbacks.push(cb);
}
function onRefreshSuccess(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
  refreshFailureCallbacks = [];
}
function onRefreshFailure() {
  refreshFailureCallbacks.forEach((cb) => cb());
  refreshSubscribers = [];
  refreshFailureCallbacks = [];
}

// ── Redirect helper (safe in SSR) ─────────────────────────────────────────────
function redirectToLogin() {
  if (typeof window === "undefined") return;
  // Don't redirect if already on an auth page — prevents loops
  if (window.location.pathname.startsWith("/auth")) return;
  window.location.replace("/auth/login");
}

// ── Request interceptor: attach stored bearer token ───────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("yv_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    // Only intercept 401s from our API, not from the refresh endpoint itself
    const isRefreshEndpoint = original?.url?.includes("/auth/refresh");
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isRefreshEndpoint
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request — it will be replayed once the in-flight refresh settles
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          original._retry = true;
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
        subscribeToRefreshFailure(() => reject(error));
      });
    }

    original._retry = true;
    isRefreshing = true;

    return axios
      .post(
        `${API_BASE}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        const newToken: string = data.access_token;
        localStorage.setItem("yv_access_token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        original.headers.Authorization = `Bearer ${newToken}`;
        onRefreshSuccess(newToken);
        return api(original);
      })
      .catch(() => {
        localStorage.removeItem("yv_access_token");
        onRefreshFailure();
        redirectToLogin();
        return Promise.reject(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  }
);

export type ApiError = AxiosError<{ detail: string }>;

export function getErrorMessage(err: unknown): string {
  const e = err as ApiError;
  return e?.response?.data?.detail ?? "Something went wrong";
}
