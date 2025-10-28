// src/services/http.ts
export const API =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:4000';

async function http<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}

export const get  = <T,>(path: string, token?: string) => http<T>(path, undefined, token);
export const post = <T,>(path: string, body?: any, token?: string) =>
  http<T>(path, { method: 'POST', body: JSON.stringify(body) }, token);
export const patch = <T,>(path: string, body?: any, token?: string) =>
  http<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token);
