import { post } from './http';
import { aget } from './http-auth';

export type User = {
  idpoblacion: number;
  matricula: string;
  codigo?: string;
  nombre: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  idempresa?: number | null;
  idestablecimiento?: number | null;
  nombre_completo?: string;
};

type LoginResponse = { ok: boolean; data: { user: User; token: string } };
type MeResponse    = { ok: boolean; data: any };

export async function loginByMatricula(matricula: string): Promise<{ user: User; token: string }> {
  const r = await post<LoginResponse>('/api/auth/login', { matricula });
  if (!r.ok) throw new Error('Matrícula no encontrada');
  return r.data; // { user, token }
}

export async function me() {
  const r = await aget<MeResponse>('/api/auth/me');
  if (!r.ok) throw new Error('No autorizado');
  return r.data;
}
