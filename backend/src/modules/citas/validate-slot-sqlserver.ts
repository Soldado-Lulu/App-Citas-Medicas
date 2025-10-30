import { sql } from '@/core/mssql';
import { getPool } from '@/core/mssql';

/** Retorna true si el slot sigue libre en SQL Server */
export async function slotSigueLibreSQLServer(idfichaprogramada: number): Promise<boolean> {
  const pool = await getPool('db1'); // db1 = bdfichas (así está en tu env)
  try {
    const rs = await pool.request()
      .input('idf', sql.Int, idfichaprogramada)
      .query(`
        SELECT TOP 1 fip_estado
        FROM bdfichas.dbo.fic_fichas_programadas
        WHERE idfichaprogramada = @idf
      `);

    if (!rs.recordset.length) return false;
    const estado = rs.recordset[0].fip_estado;
    // En tabla base: 'L' = Libre
    return estado === 'L';
  } finally {
    // el pool es singleton, no cerrar
  }
}
