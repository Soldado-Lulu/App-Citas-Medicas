import sql from 'mssql';
import { execQuery } from '@/config/db';

/** Devuelve el (idcuaderno, idestablecimiento) más usado y reciente para el médico */
export async function inferirContextoMedico(idpersonal: number) {
  const rows = await execQuery<any>('db2', `
    ;WITH base AS (
      SELECT fp.idcuaderno, fp.idestablecimiento, fp.fip_fecha_ini
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla fp
      WHERE fp.idpersonal = @idpersonal
        AND fp.fip_fecha_ini >= DATEADD(DAY, -90, GETDATE())
    ),
    sc AS (
      SELECT idcuaderno, idestablecimiento, COUNT(*) usos, MAX(fip_fecha_ini) ultimo
      FROM base GROUP BY idcuaderno, idestablecimiento
    ),
    rk AS (
      SELECT *, ROW_NUMBER() OVER (ORDER BY usos DESC, ultimo DESC, idcuaderno ASC) rn
      FROM sc
    )
    SELECT TOP 1 idcuaderno, idestablecimiento
    FROM rk WHERE rn = 1;
  `, (r: sql.Request) => r.input('idpersonal', sql.Int, idpersonal));

  return rows[0] ?? null as null | { idcuaderno: number; idestablecimiento: number };
}
