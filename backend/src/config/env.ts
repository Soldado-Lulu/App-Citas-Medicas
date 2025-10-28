import 'dotenv/config';
import sql from 'mssql';

export const env = {
  port: Number(process.env.PORT ?? 4000),

  sqlBase: {
    server: process.env.SQL_HOST!,
    user: process.env.SQL_USER!,
    password: process.env.SQL_PASSWORD!,
    // usa instanceName O port, no ambos
    options: {
      instanceName: process.env.SQL_INSTANCE, // si usas instancia nombrada
      encrypt: false,
      trustServerCertificate: true,
    },
    // port: Number(process.env.SQL_PORT ?? 1433), // si NO usas instancia nombrada
    pool: { max: 10, min: 1, idleTimeoutMillis: 30000 },
  } satisfies sql.config,

  db1: process.env.SQL_DB1 ?? 'bdfichas',
  db2: process.env.SQL_DB2 ?? 'bdhistoriasclinicas',


 // 🚫 Establecimientos bloqueados para usuarios (sin tocar BD)
  disabledEstIds: new Set(
    (process.env.DISABLED_EST_IDS || '')
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !Number.isNaN(n))
  ),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',

};
