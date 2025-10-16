// src/contexts/AuthContext.tsx
// Contexto de autenticación (demo). Mantiene el user en memoria.
// Cuando tengas backend, puedes persistir con SecureStore (móvil) o localStorage (web).

import { createContext, useContext, useMemo, useState } from "react";
import { login as loginApi } from "../services/auth.service";

export type Role = "user" | "admin";
export type User = { id: number; name: string; role: Role; matricula: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  error: string;
  // 👇 Ajuste de tipo: devolvemos el usuario o null para poder redirigir según rol
  signIn: (matricula: string, password: string) => Promise<User | null>;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  async function signIn(matricula: string, password: string): Promise<User | null> {
    setErr("");
    setLoading(true);
    try {
      const res = await loginApi(matricula, password);
      setUser(res.user);
      return res.user; // ✅ devolvemos el usuario para que la pantalla decida a dónde navegar
    } catch (e: any) {
      setErr(e?.message || "No se pudo iniciar sesión");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, error, signIn, signOut }),
    [user, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuthCtx = () => useContext(Ctx);
