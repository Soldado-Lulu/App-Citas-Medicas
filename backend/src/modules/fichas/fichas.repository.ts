// src/modules/fichas/fichas.repository.ts
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
export async function getFichaByMatricula(matricula: string) {
  const rows = await execQuery<PoblacionRow>('db2', `
    SELECT TOP 1 *
    FROM ${VIEW}
    WHERE pac_numero_historia = @matricula OR pac_codigo = @matricula
  `, (r: sql.Request) => {
    r.input('matricula', sql.VarChar, matricula.trim());
  });
  return rows[0] ?? null;
}
export async function getFichaByMatOrCode(matOrCode: string) {
  const m = (matOrCode ?? '').trim();
  if (!m) return null;

  const rows = await execQuery<any>('db2', `
    SELECT TOP 1 *
    FROM ${VIEW}
    WHERE LTRIM(RTRIM(pac_numero_historia)) = @m
       OR LTRIM(RTRIM(pac_codigo)) = @m
  `, (r: sql.Request) => r.input('m', sql.VarChar, m));
  return rows[0] ?? null;
}
// src/modules/fichas/fichas.repository.ts
// src/modules/fichas/fichas.repository.ts

// ⚠️ OJO: NO declaramos @matricula en el SQL, la recibe el batch como parámetro.
const GRUPO_INFO_SQL = `
;WITH grupo AS (  -- todos los miembros del grupo (misma matrícula)
  SELECT
      p.idpoblacion,
      p.pac_numero_historia          AS matricula,
      p.pac_codigo                   AS codigo_afiliado,
      LTRIM(RTRIM(p.pac_nombre)) + ' ' +
      LTRIM(RTRIM(p.pac_primer_apellido)) + ' ' +
      LTRIM(RTRIM(p.pac_segundo_apellido)) AS nombre_completo,
      p.pac_documento_id             AS documento,
      p.idestablecimiento            AS idest_poblacion,
      p.pac_direccion,
      p.pac_zona,
      p.pac_telefono
  FROM bdhistoriasclinicas.dbo.hcl_poblacion_datos_completos p
  WHERE LTRIM(RTRIM(p.pac_numero_historia)) = LTRIM(RTRIM(@matricula))
),
cons_ult AS (  -- todas las filas de "destino clínico" de ese grupo
  SELECT c.*
  FROM bdhistoriasclinicas.dbo.hcl_poblacion_consulta c
  WHERE LTRIM(RTRIM(c.pac_numero_historia)) = LTRIM(RTRIM(@matricula))
),
cons_rank AS (  -- elegimos UNA por persona: ACTIVO primero + más reciente
  SELECT
    c.*,
    ROW_NUMBER() OVER (
      PARTITION BY c.idpoblacion
      ORDER BY
        CASE WHEN c.estadoafiliacion = 'ACTIVO' THEN 0 ELSE 1 END,
        c.pac_fecha_afiliacion DESC,
        c.pac_fin_cobertura   DESC
    ) AS rn
  FROM cons_ult c
)
SELECT
  g.idpoblacion,
  g.matricula,
  g.codigo_afiliado,
  g.nombre_completo,
  g.documento,
  COALESCE(e.est_sigla, e.est_nombre) AS establecimiento_asignado,
  g.pac_direccion,
  g.pac_zona,
  g.pac_telefono,
  cr.idcuaderno,
  cr.cua_nombre                       AS consultorio_asignado,
  cr.est_nombre                       AS establecimiento_en_consulta
FROM grupo g
LEFT JOIN cons_rank cr
       ON cr.idpoblacion = g.idpoblacion AND cr.rn = 1
LEFT JOIN bdhistoriasclinicas.dbo.hcl_establecimientos e
       ON e.idestablecimiento = COALESCE(cr.idestablecimiento, g.idest_poblacion)
ORDER BY g.codigo_afiliado, g.nombre_completo;
`;

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

export async function findGrupoInfoByMatricula(matricula: string): Promise<GrupoInfoRow[]> {
  const rows = await execQuery<GrupoInfoRow>('db2', GRUPO_INFO_SQL, (r: sql.Request) => {
    r.input('matricula', sql.VarChar(50), (matricula ?? '').trim());
  });
  return rows;
}
