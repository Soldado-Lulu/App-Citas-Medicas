import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../services/auth.service';
import { loginByMatricula, me } from '../services/auth.service';
import { storage } from '../lib/storage';

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (matricula: string) => Promise<User | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  // Hidratar sesión si hay token guardado
  useEffect(() => {
    (async () => {
      const token = await storage.getItem(storage.TOKENS.user);
      if (!token) return;
      try {
        setLoading(true);
        const u = await me();       // obtiene datos con el token
        setUser(u?.user ?? u ?? null);
      } catch {
        await storage.removeItem(storage.TOKENS.user);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 async function signIn(matricula: string) {
  setErr(null);
  setLoading(true);
  try {
    const { user, token } = await loginByMatricula(matricula);
    await storage.setItem(storage.TOKENS.user, token);  // 👈 guarda el token
    setUser(user);
    return user;
  } catch (e: any) {
    setErr(e.message || 'Error de login');
    return null;
  } finally {
    setLoading(false);
  }
}

  async function signOut() {
    setUser(null);
    setErr(null);
    await storage.removeItem(storage.TOKENS.user);         // <- limpia token
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
