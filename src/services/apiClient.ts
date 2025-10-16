// Cliente HTTP único: usa mock si no hay API_URL
const API = process.env.EXPO_PUBLIC_API_URL; // ej. http://localhost:3000/api
import { mockHttp } from "../mocks/handlers";

type Opts = RequestInit & { body?: any };

export async function http<T>(path: string, opts: Opts = {}): Promise<T> {
  // si no hay API_URL → usa mocks
  if (!API) {
    return mockHttp<T>(path, {
      method: opts.method ?? "GET",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: opts.body,
    });
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
