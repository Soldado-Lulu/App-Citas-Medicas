// 📁 src/modules/establecimientos/establecimientos.repository.ts
// ———————————————————————————————————————————————————————————————————————————————
// Módulo responsable del acceso a datos (SQL Server) para la tabla hcl_establecimientos
// Se usa paginación con ROW_NUMBER() para compatibilidad con versiones antiguas de SQL.
// ———————————————————————————————————————————————————————————————————————————————

import { execQuery, TYPES as sql } from '@/config/db';
import type { Establecimiento, ListParams, ListResult } from './establecimientos.types';
import type { EstablecimientoCreateInput, EstablecimientoUpdateInput } from './establecimientos.dto';

// Nombre completo de la tabla (base.dbo.tabla)
const TABLE = '[bdhistoriasclinicas].[dbo].[hcl_establecimientos]';

// Identificador de conexión (usa tu alias de base de datos)
const DB: 'db1' | 'db2' = 'db1';

// ———————————————————————————————————————————————————————————————————————————————
// LISTAR ESTABLECIMIENTOS (con filtros, orden y paginación)
// ———————————————————————————————————————————————————————————————————————————————
export async function listEstablecimientos(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    idempresa,
    idsucursal,
    page = 1,
    limit = 20,
    orderBy = 'est_nombre',
    order = 'ASC',
  } = params;

  // ⚙️ Lista blanca para columnas que se pueden ordenar (previene SQL injection)
  const orderCol = ({
    est_nombre: 'est_nombre',
    idestablecimiento: 'idestablecimiento',
    idempresa: 'idempresa',
    idsucursal: 'idsucursal',
  } as const)[orderBy];

  // 🔍 Filtros dinámicos
  const where: string[] = [];
  if (q && q.trim()) where.push('(est_nombre LIKE @q OR est_sigla LIKE @q)');
  if (typeof idempresa === 'number') where.push('idempresa = @idempresa');
  if (typeof idsucursal === 'number') where.push('idsucursal = @idsucursal');
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 🔢 Parámetros de paginación
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const start = (safePage - 1) * safeLimit + 1; // fila inicial
  const end = safePage * safeLimit;             // fila final

  // 1️⃣ Obtener total de filas
  const totalRows = await execQuery<{ total: number }>(
    DB,
    `SELECT COUNT(1) AS total FROM ${TABLE} ${whereSql}`,
    (r) => {
      if (q && q.trim()) r.input('q', sql.NVarChar, `%${q.trim()}%`);
      if (typeof idempresa === 'number') r.input('idempresa', sql.Int, idempresa);
      if (typeof idsucursal === 'number') r.input('idsucursal', sql.Int, idsucursal);
    }
  );
  const total = totalRows[0]?.total ?? 0;

  // 2️⃣ Obtener las filas paginadas con ROW_NUMBER()
  const items = await execQuery<Establecimiento>(
    DB,
    `
    WITH CTE AS (
      SELECT
        idestablecimiento,
        idempresa,
        est_nombre,
        est_codigo_snis,
        idsucursal,
        est_sigla,
        ROW_NUMBER() OVER (ORDER BY ${orderCol} ${order === 'DESC' ? 'DESC' : 'ASC'}) AS rn
      FROM ${TABLE}
      ${whereSql}
    )
    SELECT idestablecimiento, idempresa, est_nombre, est_codigo_snis, idsucursal, est_sigla
    FROM CTE
    WHERE rn BETWEEN @start AND @end
    ORDER BY rn;
    `,
    (r) => {
      if (q && q.trim()) r.input('q', sql.NVarChar, `%${q.trim()}%`);
      if (typeof idempresa === 'number') r.input('idempresa', sql.Int, idempresa);
      if (typeof idsucursal === 'number') r.input('idsucursal', sql.Int, idsucursal);
      r.input('start', sql.Int, start);
      r.input('end', sql.Int, end);
    }
  );

  return { total, page: safePage, limit: safeLimit, items };
}

// ———————————————————————————————————————————————————————————————————————————————
// OBTENER UNO POR ID
// ———————————————————————————————————————————————————————————————————————————————
export async function getEstablecimientoById(id: number): Promise<Establecimiento | null> {
  const rows = await execQuery<Establecimiento>(
    DB,
    `
    SELECT idestablecimiento, idempresa, est_nombre, est_codigo_snis, idsucursal, est_sigla
    FROM ${TABLE}
    WHERE idestablecimiento = @id
    `,
    (r) => r.input('id', sql.Int, id)
  );
  return rows[0] ?? null;
}

// ———————————————————————————————————————————————————————————————————————————————
// CREAR ESTABLECIMIENTO (INSERT seguro y devuelve la fila creada)
// ———————————————————————————————————————————————————————————————————————————————
export async function createEstablecimiento(input: EstablecimientoCreateInput): Promise<Establecimiento> {
  const rows = await execQuery<Establecimiento>(
    DB,
    `
    INSERT INTO ${TABLE} (idempresa, est_nombre, est_codigo_snis, idsucursal, est_sigla)
    OUTPUT Inserted.idestablecimiento, Inserted.idempresa, Inserted.est_nombre,
           Inserted.est_codigo_snis, Inserted.idsucursal, Inserted.est_sigla
    VALUES (@idempresa, @est_nombre, @est_codigo_snis, @idsucursal, @est_sigla);
    `,
    (r) => {
      r.input('idempresa', sql.Int, input.idempresa ?? null);
      r.input('est_nombre', sql.NVarChar, input.est_nombre);
      r.input('est_codigo_snis', sql.Int, input.est_codigo_snis ?? null);
      r.input('idsucursal', sql.Int, input.idsucursal ?? null);
      r.input('est_sigla', sql.NVarChar, input.est_sigla ?? null);
    }
  );
  return rows[0];
}

// ———————————————————————————————————————————————————————————————————————————————
// ACTUALIZAR ESTABLECIMIENTO (solo campos provistos en el body)
// ———————————————————————————————————————————————————————————————————————————————
export async function updateEstablecimiento(id: number, input: EstablecimientoUpdateInput): Promise<Establecimiento | null> {
  const sets: string[] = [];

  const bind = (r: any) => {
    r.input('id', sql.Int, id);
    if (input.idempresa !== undefined) { sets.push('idempresa = @idempresa'); r.input('idempresa', sql.Int, input.idempresa ?? null); }
    if (input.est_nombre !== undefined) { sets.push('est_nombre = @est_nombre'); r.input('est_nombre', sql.NVarChar, input.est_nombre); }
    if (input.est_codigo_snis !== undefined) { sets.push('est_codigo_snis = @est_codigo_snis'); r.input('est_codigo_snis', sql.Int, input.est_codigo_snis ?? null); }
    if (input.idsucursal !== undefined) { sets.push('idsucursal = @idsucursal'); r.input('idsucursal', sql.Int, input.idsucursal ?? null); }
    if (input.est_sigla !== undefined) { sets.push('est_sigla = @est_sigla'); r.input('est_sigla', sql.NVarChar, input.est_sigla ?? null); }
  };

  if (!Object.keys(input).length) return getEstablecimientoById(id);

  const rows = await execQuery<Establecimiento>(
    DB,
    `
    UPDATE ${TABLE}
    SET ${sets.join(', ')}
    WHERE idestablecimiento = @id;

    SELECT idestablecimiento, idempresa, est_nombre, est_codigo_snis, idsucursal, est_sigla
    FROM ${TABLE}
    WHERE idestablecimiento = @id;
    `,
    bind
  );

  return rows[0] ?? null;
}

// ———————————————————————————————————————————————————————————————————————————————
// ELIMINAR ESTABLECIMIENTO (DELETE físico)
// ———————————————————————————————————————————————————————————————————————————————
export async function deleteEstablecimiento(id: number): Promise<boolean> {
  const rows = await execQuery<{ affected: number }>(
    DB,
    `
    DELETE FROM ${TABLE} WHERE idestablecimiento = @id;
    SELECT @@ROWCOUNT AS affected;
    `,
    (r) => r.input('id', sql.Int, id)
  );
  return (rows[0]?.affected ?? 0) > 0;
}
