import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveBaseURL() {
  const hostUri =
    (Constants as any).expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.hostUri;

  const lanHost = hostUri ? hostUri.split(':')[0] : 'localhost';

  if (Platform.OS === 'android') return __DEV__ ? 'http://10.0.2.2:4000' : `http://${lanHost}:4000`;
  if (Platform.OS === 'ios')     return __DEV__ ? 'http://localhost:4000' : `http://${lanHost}:4000`;
  return 'http://localhost:4000'; // web
}

export const baseURL = resolveBaseURL();

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseURL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    console.log('API ERROR', res.status, url, data);
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data as T;
}
