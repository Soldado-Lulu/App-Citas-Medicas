// src/services/auth.service.ts
import { apiPost } from './http';

export type User = {
  idpoblacion: number;
  matricula: string;
  codigo?: string;
  nombre: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  idempresa?: number;
  idestablecimiento?: number;
  nombre_completo?: string;
};

export type LoginResponse = { ok: boolean; user: User };

export async function loginByMatricula(matricula: string): Promise<User> {
  const r = await apiPost<LoginResponse>('/api/auth/login', { matricula });
  if (!r.ok) throw new Error('Matrícula no encontrada');
  return r.user;
}
