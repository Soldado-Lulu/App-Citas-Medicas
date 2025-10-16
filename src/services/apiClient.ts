// Cliente HTTP único. Si EXPO_PUBLIC_API_URL existe → usa API real (fetch).
// Si no existe → usa mocks (handlers).

const BASE = process.env.EXPO_PUBLIC_API_URL?.trim();

export type Http = <T>(path: string, init?: RequestInit) => Promise<T>;

async function httpReal<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

import { mockHttp } from "../mocks/handlers";
export const http: Http = BASE ? httpReal : mockHttp;
