import sql from 'mssql';
import { execQuery } from '@/config/db';

export type AuthUser = {
  idpoblacion: number;
  pac_numero_historia: string | null;
  pac_codigo: string | null;
  pac_nombre: string | null;
  pac_primer_apellido: string | null;
  pac_segundo_apellido: string | null;
  idempresa: number | null;
  idestablecimiento: number | null;
  idsexo: number | null;
  pac_documento_id: string | null;
  pac_fecha_nac: string | null;
};

const VIEW = 'dbo.hcl_poblacion_datos_completos';

export async function findByMatricula(matricula: string) {
  const mat = matricula.trim();
  const rows = await execQuery<AuthUser>('db2', `
    SELECT TOP 1 *
    FROM ${VIEW}
    WHERE
      pac_numero_historia = @mat
      OR pac_codigo = @mat      -- opcional: permitir buscar también por código
  `, (r: sql.Request) => {
    r.input('mat', sql.VarChar, mat);
  });
  return rows[0] ?? null;
}
export async function findIdPersonalByCI(ci?: string | null): Promise<number | undefined> {
  const doc = (ci ?? '').trim();
  if (!doc) return undefined;

  const rows = await execQuery<any>('db2', `
    SELECT TOP 1 ps.idpersonalmedico
    FROM bdhistoriasclinicas.dbo.hcl_personal_salud ps
    WHERE LTRIM(RTRIM(ps.ci)) = @ci
      AND ps.per_estado = 'A'     -- si existe ese flag de activo; quítalo si no
  `, (r: sql.Request) => r.input('ci', sql.VarChar(50), doc));

  return rows?.[0]?.idpersonalmedico ?? undefined;
}