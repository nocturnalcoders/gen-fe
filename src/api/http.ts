// Fetch wrapper for the REST adapter.
// Adds the base URL, Bearer JWT, JSON handling, and a single refresh retry on 401.

import { authStore } from "./auth-store";

// "/api" is where the gateway serves the API, on the same origin as this site.
// In development .env.development points this at the API running locally.
export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.trim() || "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: Options["query"]) {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function rawRequest(path: string, opts: Options): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = authStore.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return false;
  const res = await rawRequest("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
  if (!res.ok) {
    authStore.clear();
    return false;
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken?: string | null;
    user: { id: string; email: string | null; displayName: string | null; avatarUrl: string | null };
  };
  authStore.setSession({ user: data.user, accessToken: data.accessToken }, { refreshToken: data.refreshToken ?? refreshToken });
  return true;
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  let res = await rawRequest(path, opts);

  if (res.status === 401 && opts.auth !== false && (await refreshSession())) {
    res = await rawRequest(path, opts);
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const payload = (await res.json()) as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? message;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const http = {
  get: <T>(path: string, query?: Options["query"], auth = true) =>
    request<T>(path, { method: "GET", query, auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "PATCH", body, auth }),
  del: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE", auth }),
};
