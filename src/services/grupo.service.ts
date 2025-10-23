// src/services/grupo.service.ts
import { apiGet } from './http';

export type GrupoInfoRow = {
  idpoblacion: number;
  matricula: string;
  codigo_afiliado: string;
  nombre_completo: string;
  documento: string | null;
  establecimiento_asignado: string | null;
  pac_direccion: string | null;
  pac_zona: string | null;
  pac_telefono: string | null;
  idcuaderno: number | null;
  consultorio_asignado: string | null;
  establecimiento_en_consulta: string | null;
};

export async function getGrupoInfo(matricula: string): Promise<GrupoInfoRow[]> {
  const url = `/api/fichas/grupo-info/${encodeURIComponent(matricula.trim())}`;
  const res = await apiGet(url); // si tu http.ts agrega el token, no toques nada
  return (res?.rows ?? []) as GrupoInfoRow[];
}
