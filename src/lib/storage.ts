// lib/storage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKENS = {
  admin: 'admin_token',
  user: 'user_token',
};

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key); // ✅ API correcta
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value); // ✅
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key); // ✅
}

export const storage = {
  TOKENS,
  getItem, setItem, removeItem
};
