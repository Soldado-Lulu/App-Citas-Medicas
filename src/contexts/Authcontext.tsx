// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../services/auth.service';
import { loginByMatricula } from '../services/auth.service';

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

  // Si quieres hidratar desde storage en el futuro, hazlo aquí
  useEffect(() => {
    // p.ej. leer AsyncStorage y setUser(...)
  }, []);

  async function signIn(matricula: string) {
    setErr(null);
    setLoading(true);
    try {
      const u = await loginByMatricula(matricula);
      setUser(u);
      return u;
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
  }

  return (
    <AuthContext.Provider value={{ user, loading, error: error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
