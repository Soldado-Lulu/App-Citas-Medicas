import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Si prefieres localStorage en web, cambia las funciones web a localStorage.*

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export async function setItem(key: string, value: string) {
  if (isNative) {
    return SecureStore.setItemAsync(key, value);
  }
  // WEB
  return AsyncStorage.setItem(key, value);
}

export async function getItem(key: string) {
  if (isNative) {
    return SecureStore.getItemAsync(key);
  }
  // WEB
  return AsyncStorage.getItem(key);
}

export async function deleteItem(key: string) {
  if (isNative) {
    return SecureStore.deleteItemAsync(key);
  }
  // WEB
  return AsyncStorage.removeItem(key);
}
