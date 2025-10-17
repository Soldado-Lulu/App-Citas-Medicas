import sql from 'mssql';
import { env } from '@/config/env';

type DBKey = 'db1' | 'db2';
const pools: Partial<Record<DBKey, sql.ConnectionPool>> = {};

async function createPool(database: string) {
  const cfg: sql.config = { ...env.sqlBase, database }; // ← tipado exacto
  const pool = await new sql.ConnectionPool(cfg).connect();
  return pool;
}

export async function getPool(which: DBKey) {
  if (pools[which] && pools[which]!.connected) return pools[which]!;
  const dbName = which === 'db1' ? env.db1 : env.db2;
  pools[which] = await createPool(dbName);
  return pools[which]!;
}

export const TYPES = sql;

export async function execQuery<T = any>(
  which: DBKey,
  query: string,
  bind?: (r: sql.Request) => void
): Promise<T[]> {
  const pool = await getPool(which);
  const req = pool.request();
  bind?.(req);
  const result = await req.query<T>(query);
  return (result.recordset ?? []) as T[];
}

export async function execSP<T = any>(
  which: DBKey,
  spName: string,
  bind?: (r: sql.Request) => void
): Promise<sql.IResult<T>> {
  const pool = await getPool(which);
  const req = pool.request();
  bind?.(req);
  return req.execute<T>(spName);
}
