// src/services/http.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { access } from 'fs';
function resolveBaseURL() {
  const hostUri =
    (Constants as any).expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.hostUri;

  const lanHost = hostUri ? hostUri.split(':')[0] : 'localhost';
  if (Platform.OS === 'android') return __DEV__ ? 'http://10.0.2.2:4000' : `http://${lanHost}:4000`;
  if (Platform.OS === 'ios')     return __DEV__ ? 'http://localhost:4000' : `http://${lanHost}:4000`;
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
}

export const baseURL = resolveBaseURL();
export async function apiPost<T = any>(path: string, body?: any, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.msg || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
export async function apiGet<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseURL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.msg || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}