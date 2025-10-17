// src/modules/historias/historias.repository.ts
import { execSP, TYPES } from '@/config/db';

export async function obtenerDatosPoblacion(params: {
  i_tipo: '1'|'2';
  i_idpoblacion?: number;
  i_idempresa?: number;
  i_fecha_edad?: string;   // 'YYYY-MM-DD'
  i_fecha_actual?: string; // 'YYYY-MM-DD'
}) {
  const res = await execSP('db2', 'dbo.proc_datos_poblacion', (r) => {
    r.input('i_tipo', TYPES.Char(1), params.i_tipo);
    r.input('i_idpoblacion', TYPES.Int, params.i_idpoblacion ?? null);
    r.input('i_idempresa', TYPES.Int, params.i_idempresa ?? null);
    r.input('i_fecha_edad', TYPES.Date, params.i_fecha_edad ?? null);
    r.input('i_fecha_actual', TYPES.Date, params.i_fecha_actual ?? null);
  });
  return res.recordset ?? [];
}
