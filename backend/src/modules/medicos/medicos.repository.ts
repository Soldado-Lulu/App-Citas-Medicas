// 📁 src/modules/especialidades/especialidades.repository.ts
// ---------------------------------------------------------------------------
// Repositorio solo de lectura para la tabla hcl_especialidad_medico
// Devuelve los campos idcuaderno, especialidad y medico.
// Incluye filtros básicos por nombre o id.
// ---------------------------------------------------------------------------

import { execQuery, TYPES as sql } from '@/config/db';

export type EspecialidadMedico = {
  idcuaderno: number;
  especialidad: string;
  medico: string | null;
};

export type ListParams = {
  q?: string; // búsqueda por especialidad o médico
  page?: number;
  limit?: number;
  orderBy?: 'idcuaderno' | 'especialidad' | 'medico';
  order?: 'ASC' | 'DESC';
};

// Base y tabla
const DB: 'db1' | 'db2' = 'db1';
const TABLE = '[bdhistoriasclinicas].[dbo].[hcl_especialidad_medico]';

export async function listMedicos(params: ListParams = {}) {
  const {
    q,
    page = 1,
    limit = 25,
    orderBy = 'especialidad',
    order = 'ASC',
  } = params;

  // Lista blanca para ORDER BY
  const orderCol = ({
    idcuaderno: 'idcuaderno',
    especialidad: 'especialidad',
    medico: 'medico',
  } as const)[orderBy];

  // Filtro dinámico
  const where: string[] = [];
  if (q && q.trim()) where.push('(especialidad LIKE @q OR medico LIKE @q)');
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Paginación segura (ROW_NUMBER)
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const start = (safePage - 1) * safeLimit + 1;
  const end = safePage * safeLimit;

  // Total de registros
  const totalRows = await execQuery<{ total: number }>(
    DB,
    `SELECT COUNT(1) AS total FROM ${TABLE} ${whereSql}`,
    (r) => {
      if (q && q.trim()) r.input('q', sql.NVarChar, `%${q.trim()}%`);
    }
  );
  const total = totalRows[0]?.total ?? 0;

  // Consulta paginada
  const items = await execQuery<EspecialidadMedico>(
    DB,
    `
    WITH CTE AS (
      SELECT
        idcuaderno,
        especialidad,
        medico,
        ROW_NUMBER() OVER (ORDER BY ${orderCol} ${order === 'DESC' ? 'DESC' : 'ASC'}) AS rn
      FROM ${TABLE}
      ${whereSql}
    )
    SELECT idcuaderno, especialidad, medico
    FROM CTE
    WHERE rn BETWEEN @start AND @end
    ORDER BY rn;
    `,
    (r) => {
      if (q && q.trim()) r.input('q', sql.NVarChar, `%${q.trim()}%`);
      r.input('start', sql.Int, start);
      r.input('end', sql.Int, end);
    }
  );

  return { total, page: safePage, limit: safeLimit, items };
}

export async function getMedicosById(idcuaderno: number) {
  const rows = await execQuery<EspecialidadMedico>(
    DB,
    `
    SELECT idcuaderno, especialidad, medico
    FROM ${TABLE}
    WHERE idcuaderno = @idcuaderno;
    `,
    (r) => r.input('idcuaderno', sql.Int, idcuaderno)
  );
  return rows[0] ?? null;
}
// ——————————————————————————————————————————————————————————————
// LISTAR TODAS LAS ESPECIALIDADES (sin filtros ni paginación)
// ——————————————————————————————————————————————————————————————
export async function listAllMedicos() {
  return execQuery(
    DB,
    `SELECT idcuaderno, especialidad, medico FROM ${TABLE} ORDER BY especialidad ASC;`
  );
}
