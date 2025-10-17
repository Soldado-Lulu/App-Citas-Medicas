// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginByMatricula,  } from '../services/auth.service';
import type {  } from '../services/auth.service';

type Role = 'admin' | 'user';
type AuthState = {
  user:  | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  signIn: (matricula: string) => Promise<( & { role: Role }) | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState< | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (token && user) {
        setUser(user);
        setRole((user.matricula || '').endsWith('00') ? 'admin' : 'user');
      }
      setLoading(false);
    })();
  }, []);

  async function signIn(matricula: string) {
    setErr(null);
    setLoading(true);
    try {
      const r = await loginByMatricula(matricula);
      setRole(r.role);
      return { ...r.user, role: r.role };
    } catch (e: any) {
      setErr(e.message || 'Error de login');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
