import { api } from './http';

type AuthUser = {
  idpoblacion: number;
  matricula: string | null;
  nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
};
type Role = 'admin' | 'user';

type LoginResponse = { ok: boolean; token: string; user: AuthUser };

export async function loginByMatricula(matricula: string) {
  const res = await api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ matricula }),
  });
  const role: Role = (res.user.matricula || '').endsWith('00') ? 'admin' : 'user';
  return { ...res, role };
}
