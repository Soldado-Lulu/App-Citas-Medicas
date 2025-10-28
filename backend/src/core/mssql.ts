// src/core/mssql.ts
import * as sql from 'mssql';

type DBName = 'db1' | 'db2';

const cfgBase = {
  server: process.env.SQL_HOST ?? '127.0.0.1',
  user: process.env.SQL_USER ?? 'sa',
  password: process.env.SQL_PASSWORD ?? '',
  port: Number(process.env.SQL_PORT ?? 1433),
  options: {
    encrypt: (process.env.SQL_ENCRYPT ?? 'false') === 'true',
    trustServerCertificate: (process.env.SQL_TRUST_CERT ?? 'true') === 'true',
    enableArithAbort: true,
    // Si usas instancia nombrada, descomenta:
    // instanceName: process.env.SQL_INSTANCE, // p.ej. MSSQLSERVER
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
} as const;

const DB1 = process.env.SQL_DB1 ?? 'bdfichas';
const DB2 = process.env.SQL_DB2 ?? 'bdhistoriasclinicas';

const pools: Partial<Record<DBName, Promise<sql.ConnectionPool>>> = {};

function makeConfigFor(database: string) {
  return { ...cfgBase, database };
}

export async function getPool(db: DBName): Promise<sql.ConnectionPool> {
  if (!pools[db]) {
    const database = db === 'db1' ? DB1 : DB2;
    const cfg = makeConfigFor(database) as sql.config;
    pools[db] = new sql.ConnectionPool(cfg).connect();
  }
  return pools[db]!;
}

export { sql };
