// src/lib/storage.ts
// ————————————————————————————————————————————————
// Wrapper muy simple sobre AsyncStorage para guardar tokens.
// Si en el futuro cambias de almacenamiento, solo tocas aquí.
// ————————————————————————————————————————————————
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  TOKENS: {
    user: 'token_user',
    admin: 'token_admin',
  },

  async getItem(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};
