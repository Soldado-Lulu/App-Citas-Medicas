// src/services/grupo.service.ts
import { get } from './http';

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

// 👇 tipo exacto de lo que esperas del backend
type GrupoInfoResp = { rows: GrupoInfoRow[] };

export async function getGrupoInfo(matricula: string): Promise<GrupoInfoRow[]> {
  const url = `/api/fichas/grupo-info/${encodeURIComponent(matricula.trim())}`;

  // 👇 ahora TS sabe que res tiene .rows
  const res = await get<GrupoInfoResp>(url);
  return res.rows ?? [];
}
