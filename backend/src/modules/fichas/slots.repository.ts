// src/modules/fichas/slots.repository.ts
import { execQuery } from '@/config/db';

// Trae horarios libres para los próximos 2 días hábiles
export async function getHorariosLibres(
  fecha1: string,
  fecha2: string,
  filtros: { idpersonal?: number; idcuaderno?: number; idestablecimiento?: number }
) {
  let sql = `
    SELECT
      fp.idfichaprogramada,
      fp.idpersonal,
      fp.idcuaderno,
      fp.idestablecimiento,
      CONVERT(date, fp.fip_fecha_ini) AS fecha,
      CAST(fp.fip_fecha_ini AS time)  AS hora_inicio,
      fp.fip_hora_fin                 AS hora_fin,
      'L' AS fip_estado
    FROM fic_fichas_programadas_pantalla fp
    WHERE fp.fip_estado = 'L'
      AND CONVERT(date, fp.fip_fecha_ini) IN (CONVERT(date, @p0), CONVERT(date, @p1))
  `;

  const params: any[] = [fecha1, fecha2];

  if (filtros.idpersonal) {
    sql += ` AND fp.idpersonal = @p${params.length}`;
    params.push(filtros.idpersonal);
  }
  if (filtros.idcuaderno) {
    sql += ` AND fp.idcuaderno = @p${params.length}`;
    params.push(filtros.idcuaderno);
  }
  if (filtros.idestablecimiento) {
    sql += ` AND fp.idestablecimiento = @p${params.length}`;
    params.push(filtros.idestablecimiento);
  }

  sql += ` ORDER BY CONVERT(date, fp.fip_fecha_ini), CAST(fp.fip_fecha_ini AS time), fp.fip_hora_fin`;

  return await execQuery<any>('db1', sql, params);
}

// Verifica que un slot esté LIBRE por id
export async function getSlotById(idficha: number) {
  const sql = `
    SELECT
      fp.idfichaprogramada,
      fp.idpersonal,
      fp.idcuaderno,
      fp.idestablecimiento,
      CONVERT(date, fp.fip_fecha_ini) AS fecha,
      CAST(fp.fip_fecha_ini AS time)  AS hora_inicio,
      fp.fip_hora_fin AS hora_fin,
      fp.fip_estado
    FROM fic_fichas_programadas_pantalla fp
    WHERE fp.idfichaprogramada = @p0 AND fp.fip_estado = 'L'
  `;
  const rows = await execQuery<any>('db1', sql, [idficha]);
  return rows[0];
}
