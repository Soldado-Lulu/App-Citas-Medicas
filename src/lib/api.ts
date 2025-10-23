// lib/api.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'admin_token';

// Usa variable pública de Expo si la pones en .env o app.json
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:4000'; // ⚠️ en dispositivo físico usa tu IP local

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || err?.msg || `HTTP ${res.status}`);
  }
  return safeJson(res);
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
