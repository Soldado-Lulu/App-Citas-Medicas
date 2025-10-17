import { api } from './http';

export type Persona = {
  idpoblacion: number;
  matricula: string | null;
  nombre_completo: string; // lo armamos en el front si quieres
  pac_nombre: string | null;
  pac_primer_apellido: string | null;
  pac_segundo_apellido: string | null;
  documento: string | null;
};

type ListResponse = {
  ok: boolean;
  page: number;
  size: number;
  total?: number;
  rows: Array<{
    idpoblacion: number;
    pac_numero_historia: string | null;
    pac_nombre: string | null;
    pac_primer_apellido: string | null;
    pac_segundo_apellido: string | null;
    pac_documento_id: string | null;
  }>;
};

export async function getPersonas(q = '', page = 1, size = 20) {
  const res = await api<ListResponse>(`/api/fichas?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
  const personas: Persona[] = res.rows.map(r => ({
    idpoblacion: r.idpoblacion,
    matricula: r.pac_numero_historia,
    pac_nombre: r.pac_nombre,
    pac_primer_apellido: r.pac_primer_apellido,
    pac_segundo_apellido: r.pac_segundo_apellido,
    documento: r.pac_documento_id,
    nombre_completo: [r.pac_nombre, r.pac_primer_apellido, r.pac_segundo_apellido].filter(Boolean).join(' ')
  }));
  return { ...res, personas };
}
