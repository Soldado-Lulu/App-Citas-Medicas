// backend/src/modules/especialidades/especialidades.repository.ts
import sql from 'mssql';
import { execQuery } from '@/config/db';

const VIEW = 'bdfichas.dbo.fic_fichas_programadas_pantalla';

/** Lista cuadernos (especialidades) del establecimiento, con filtros */
export async function listarEspecialidades(idest: number, buscar: string) {
  const q = `
    SELECT 
      c.idCuaderno          AS idcuaderno,
      c.cua_nombre          AS nombre,
      c.cua_sigla           AS sigla,
      c.idtipoespecialidad  AS idtipoespecialidad,
      c.cua_hora_inicio,
      c.cua_hora_fin,
      c.cua_estado
    FROM bdhistoriasclinicas.dbo.hcl_cuaderno AS c
    WHERE
      (@idest IS NULL OR c.idEmpresa = @idest)
      AND (
        @buscar = '' OR
        c.cua_nombre LIKE '%' + @buscar + '%' OR
        c.cua_sigla  LIKE '%' + @buscar + '%'
      )
     AND (
  UPPER(c.cua_nombre) LIKE '%MEDICINA FAMILIAR%' OR
  UPPER(c.cua_nombre) LIKE '%MEDICINA GENERAL%'
)

    ORDER BY c.cua_nombre;
  `;

  const rows = await execQuery<any>('db2', q, (r: sql.Request) => {
    r.input('idest', sql.Int, idest || null);
    r.input('buscar', sql.VarChar(100), buscar || '');
  });

  return rows;
}


/** Conteo de libres por día para una especialidad dada */
export async function contarLibresPorDia(idcuaderno: number, idest: number, desde: string, hasta?: string) {
  const q = `
    SELECT CONVERT(date, fip_fecha_ini) AS fecha, COUNT(*) AS libres
    FROM ${VIEW}
    WHERE idcuaderno = @idc
      AND idestablecimiento = @idest
      AND fip_estado IN ('L','Disponible')
      AND fichasinpaciente = 1
      AND CONVERT(date, fip_fecha_ini) BETWEEN @f1 AND COALESCE(@f2, @f1)
    GROUP BY CONVERT(date, fip_fecha_ini)
    ORDER BY fecha;
  `;
  return execQuery<any>('db2', q, r => {
    r.input('idc',   sql.Int, idcuaderno);
    r.input('idest', sql.Int, idest);
    r.input('f1',    sql.Date, desde);
    r.input('f2',    sql.Date, hasta || null);
  });
}

/** Lista horas libres de una fecha específica */
export async function listarLibresEnFecha(idcuaderno: number, idest: number, fecha: string) {
  const q = `
    SELECT
      idfichaprogramada,
      CAST(fip_fecha_ini AS time) AS hora_inicio,
      CAST(fip_hora_fin  AS time) AS hora_fin
    FROM ${VIEW}
    WHERE idcuaderno = @idc
      AND idestablecimiento = @idest
      AND fip_estado IN ('L','Disponible')
      AND fichasinpaciente = 1
      AND CONVERT(date, fip_fecha_ini) = @f
    ORDER BY fip_fecha_ini;
  `;
  return execQuery<any>('db2', q, r => {
    r.input('idc',   sql.Int, idcuaderno);
    r.input('idest', sql.Int, idest);
    r.input('f',     sql.Date, fecha);
  });
}

/** Para validar en reserva que la ficha pertenezca al cuaderno */
export async function getFichaPorId(idficha: number) {
  const q = `
    SELECT TOP 1 idfichaprogramada, idpersonal, idcuaderno, idestablecimiento, fip_fecha_ini, fip_hora_fin
    FROM ${VIEW}
    WHERE idfichaprogramada = @idf
  `;
  const rows = await execQuery<any>('db2', q, r => r.input('idf', sql.Int, idficha));
  return rows[0] ?? null;
}
