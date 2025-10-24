// backend/src/modules/admin/disabledEst.repository.ts
import { Pool } from 'pg';
import { pg } from '@/config/pg'; // 👈 tu Pool exportado
// Si usas alias @, asegúrate que tsconfig paths estén OK.

const pool: Pool = pg;

// Lista de idestablecimiento deshabilitados (PG)
export async function listDisabled(): Promise<number[]> {
  const result = await pool.query(
    'SELECT idestablecimiento FROM admin_disabled_establecimientos'
  );
  return result.rows.map(r => Number(r.idestablecimiento));
}

export async function isDisabled(id: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM admin_disabled_establecimientos WHERE idestablecimiento = $1',
    [id]
  );
  const rowCount = result.rowCount ?? 0; // 👈 sin warnings
  return rowCount > 0;
}

export async function disable(id: number, by?: string): Promise<void> {
  await pool.query(
    `INSERT INTO admin_disabled_establecimientos (idestablecimiento, disabled_by)
     VALUES ($1, $2)
     ON CONFLICT (idestablecimiento) DO NOTHING`,
    [id, by ?? null]
  );
}

export async function enable(id: number): Promise<void> {
  await pool.query(
    'DELETE FROM admin_disabled_establecimientos WHERE idestablecimiento = $1',
    [id]
  );
}

export async function setDisabled(id: number, disabled: boolean, by?: string): Promise<void> {
  if (disabled) return disable(id, by);
  return enable(id);
}
