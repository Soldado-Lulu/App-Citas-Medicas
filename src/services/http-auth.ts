// src/services/http-auth.ts
import { API, get, post, patch } from './http';
import { storage } from '../lib/storage';

/** Wraps get/post adding Bearer token from storage automatically */
export async function aget<T>(path: string): Promise<T> {
  const token = await storage.getItem(storage.TOKENS.user);
  return get<T>(path, token || undefined);
}

export async function apost<T>(path: string, body?: any): Promise<T> {
  const token = await storage.getItem(storage.TOKENS.user);
  return post<T>(path, body, token || undefined);
}

export async function apatch<T>(path: string, body?: any): Promise<T> {
  const token = await storage.getItem(storage.TOKENS.user);
  return patch<T>(path, body, token || undefined);
}
