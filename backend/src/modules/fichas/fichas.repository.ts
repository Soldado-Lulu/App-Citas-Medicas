import sql from 'mssql';
import { execQuery } from '@/config/db';

// Tipamos lo básico de la vista (puedes añadir más campos si necesitas)
export type PoblacionRow = {
  idpoblacion: number;
  idempresa: number | null;
  idestablecimiento: number | null;
  pac_numero_historia: string | null;
  pac_codigo: string | null;
  pac_nombre: string | null;
  pac_primer_apellido: string | null;
  pac_segundo_apellido: string | null;
  pac_documento_id: string | null;
  idtipodocumento: number | null;
  idsexo: number | null;
  pac_fecha_nac: string | null; // Date en texto (YYYY-MM-DD) según tu vista
};

const VIEW = 'dbo.hcl_poblacion_datos_completos';

/** Listado paginado con búsqueda por nombre/apellidos/código/historia/documento */
export async function listarFichas(
  q = '',
  page = 1,
  size = 20,
  idempresa?: number,
  idestablecimiento?: number
) {
  const desde = (page - 1) * size;
  // Filtro básico: LIKE sobre varios campos + filtros opcionales por empresa/establecimiento
  return execQuery<PoblacionRow>('db2', `
    WITH data AS (
      SELECT
        *,
        ROW_NUMBER() OVER (ORDER BY idpoblacion DESC) AS rn
      FROM ${VIEW}
      WHERE
        (@filtro = '' OR
          pac_nombre LIKE @like OR
          pac_primer_apellido LIKE @like OR
          pac_segundo_apellido LIKE @like OR
          pac_codigo LIKE @like OR
          pac_numero_historia LIKE @like OR
          pac_documento_id LIKE @like
        )
        AND (@idempresa IS NULL OR idempresa = @idempresa)
        AND (@idestablecimiento IS NULL OR idestablecimiento = @idestablecimiento)
    )
    SELECT *
    FROM data
    WHERE rn BETWEEN @desde + 1 AND @desde + @size;
  `, (r: sql.Request) => {
    r.input('filtro', sql.VarChar, q.trim());
    r.input('like', sql.VarChar, `%${q.trim()}%`);
    r.input('idempresa', sql.Int, idempresa ?? null);
    r.input('idestablecimiento', sql.Int, idestablecimiento ?? null);
    r.input('desde', sql.Int, desde);
    r.input('size', sql.Int, size);
  });
}

/** Búsqueda por idpoblacion (detalle) */
export async function getFichaById(idpoblacion: number) {
  const rows = await execQuery<PoblacionRow>('db2', `
    SELECT TOP 1 *
    FROM ${VIEW}
    WHERE idpoblacion = @idpoblacion
    ORDER BY idpoblacion DESC;
  `, (r: sql.Request) => {
    r.input('idpoblacion', sql.Int, idpoblacion);
  });
  return rows[0] ?? null;
}
