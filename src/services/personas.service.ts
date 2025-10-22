import { apiGet } from './http';

export type Persona = {
  idpoblacion: number;
  matricula: string | null;
  nombre_completo: string;
  pac_nombre: string | null;
  pac_primer_apellido: string | null;
  pac_segundo_apellido: string | null;
  documento: string | null;
};

export async function getPersonaByMatricula(matricula: string) {
  const r = await apiGet<{ ok:boolean; persona:any }>(
    `/api/fichas/personas/matricula?matricula=${encodeURIComponent(matricula)}`
  );
  const p = r.persona;
  return {
    idpoblacion: p.idpoblacion,
    matricula: p.matricula,
    documento: p.documento,
    pac_nombre: p.pac_nombre,
    pac_primer_apellido: p.pac_primer_apellido,
    pac_segundo_apellido: p.pac_segundo_apellido,
    nombre_completo: [p.pac_nombre, p.pac_primer_apellido, p.pac_segundo_apellido].filter(Boolean).join(' '),
  } as Persona;
}

export async function getAfiliados(idpoblacion: number) {
  const r = await apiGet<{ ok:boolean; afiliados:any[] }>(
    `/api/fichas/personas/${idpoblacion}/afiliados`
  );
  return (r.afiliados || []).map(p => ({
    idpoblacion: p.idpoblacion,
    matricula: p.matricula,
    documento: p.documento,
    pac_nombre: p.pac_nombre,
    pac_primer_apellido: p.pac_primer_apellido,
    pac_segundo_apellido: p.pac_segundo_apellido,
    nombre_completo: [p.pac_nombre, p.pac_primer_apellido, p.pac_segundo_apellido].filter(Boolean).join(' '),
  })) as Persona[];
}
