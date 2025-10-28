import sql from 'mssql';
import { execQuery } from '@/config/db';

/**
 * Devuelve el consultorio (idcuaderno) y establecimiento (idest) asignado al paciente
 * priorizando afiliación ACTIVA y el registro más reciente.
 */
export async function getConsultorioDePaciente(matricula: string) {
  const rows = await execQuery<any>('db2', `
    ;WITH cons AS (
      SELECT
        c.idpoblacion,
        c.idcuaderno,
        c.idestablecimiento,
        c.estadoafiliacion,
        c.pac_fecha_afiliacion,
        c.pac_fin_cobertura
      FROM bdhistoriasclinicas.dbo.hcl_poblacion_consulta c
      WHERE LTRIM(RTRIM(c.pac_numero_historia)) = LTRIM(RTRIM(@m))
    ),
    rk AS (
      SELECT *,
        ROW_NUMBER() OVER (
          ORDER BY
            CASE WHEN estadoafiliacion = 'ACTIVO' THEN 0 ELSE 1 END,
            pac_fecha_afiliacion DESC,
            pac_fin_cobertura DESC
        ) rn
      FROM cons
    )
    SELECT TOP 1 idcuaderno, idestablecimiento
    FROM rk WHERE rn = 1;
  `, (r: sql.Request) => r.input('m', sql.VarChar(50), (matricula ?? '').trim()));

  return rows[0] ?? null as null | { idcuaderno: number; idestablecimiento: number };
}
