// lib/api.ts
import { storage } from './storage';

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') as string) ||
  'http://localhost:4000'; // en dispositivo físico: pon la IP local

async function jsonOrNull(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function authFetch(path: string, init: RequestInit = {}) {
  // Prioriza token admin, si no hay, usa el de user
  const tokenAdmin = await storage.getItem(storage.TOKENS.admin);
  const tokenUser  = await storage.getItem(storage.TOKENS.user);
  const token = tokenAdmin || tokenUser || undefined;

  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await jsonOrNull(res);
    throw new Error(err?.msg || err?.message || `HTTP ${res.status}`);
  }
  return jsonOrNull(res);
}
