// Token storage for the REST adapter.
// Access token is kept in memory + localStorage so a refresh keeps the session.

import type { Session } from "./types";

const ACCESS_KEY = "garuda.access_token";
const REFRESH_KEY = "garuda.refresh_token";
const USER_KEY = "garuda.user";

type Listener = (session: Session | null) => void;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let session: Session | null = null;
let hydrated = false;
const listeners = new Set<Listener>();

function isBrowser() {
  return typeof window !== "undefined";
}

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  try {
    accessToken = localStorage.getItem(ACCESS_KEY);
    refreshToken = localStorage.getItem(REFRESH_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (raw && accessToken) {
      session = { user: JSON.parse(raw), accessToken };
    }
  } catch {
    session = null;
  }
}

export const authStore = {
  getAccessToken(): string | null {
    hydrate();
    return accessToken;
  },
  getRefreshToken(): string | null {
    hydrate();
    return refreshToken;
  },
  getSession(): Session | null {
    hydrate();
    return session;
  },
  setSession(next: Session | null, tokens?: { refreshToken?: string | null }) {
    hydrate();
    session = next;
    accessToken = next?.accessToken ?? null;
    if (tokens && "refreshToken" in tokens) refreshToken = tokens.refreshToken ?? null;
    if (isBrowser()) {
      try {
        if (next && accessToken) {
          localStorage.setItem(ACCESS_KEY, accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(next.user));
        } else {
          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(USER_KEY);
        }
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
        else localStorage.removeItem(REFRESH_KEY);
      } catch {
        // storage unavailable — session stays in memory only
      }
    }
    listeners.forEach((l) => l(session));
  },
  clear() {
    this.setSession(null, { refreshToken: null });
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};