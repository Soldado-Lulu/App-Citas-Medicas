import sql from 'mssql';
import { execQuery } from '@/config/db';

const VIEW = 'bdfichas.dbo.fic_fichas_programadas_pantalla';

export async function contarSlotsLibresPorDia(idcuaderno: number, idest: number, desde: string, hasta?: string) {
  const q = `
    SELECT
      CONVERT(date, fip_fecha_ini) AS fecha,
      COUNT(*) AS libres
    FROM ${VIEW}
    WHERE idcuaderno = @idc
      AND idestablecimiento = @idest
      AND fip_estado IN ('L','Disponible')
      AND fichasinpaciente = 1
      AND CONVERT(date, fip_fecha_ini) BETWEEN @f1 AND COALESCE(@f2, @f1)
    GROUP BY CONVERT(date, fip_fecha_ini)
    ORDER BY fecha;
  `;
  const rows = await execQuery<any>('db2', q, (r: sql.Request) => {
    r.input('idc', sql.Int, idcuaderno);
    r.input('idest', sql.Int, idest);
    r.input('f1', sql.Date, desde);
    r.input('f2', sql.Date, hasta ?? null);
  });
  return rows as Array<{ fecha: string; libres: number }>;
}

export async function listarSlotsLibres(
  idcuaderno: number,
  idest: number,
  fecha: string
) {
  const q = `
    SELECT
      idfichaprogramada,
      CONVERT(char(5), CAST(fip_fecha_ini AS time), 108) AS hora
    FROM ${VIEW}
    WHERE idcuaderno = @idc
      AND idestablecimiento = @idest
      AND fip_estado IN ('L','Disponible')
      AND fichasinpaciente = 1
      AND CONVERT(date, fip_fecha_ini) = @f
    ORDER BY fip_fecha_ini;
  `;
  const rows = await execQuery<any>('db2', q, (r: sql.Request) => {
    r.input('idc', sql.Int, idcuaderno);
    r.input('idest', sql.Int, idest);
    r.input('f', sql.Date, fecha);
  });
  return rows as Array<{ idfichaprogramada: number; hora: string }>;
}
