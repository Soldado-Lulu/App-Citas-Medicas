import 'dotenv/config';
import sql from 'mssql';
import type { SecureVersion } from 'tls';

// Elige la mínima versión que necesites. Si tu SQL es antiguo, usa 'TLSv1'.
const TLS_MIN: SecureVersion = 'TLSv1'; // o 'TLSv1.2' si el server lo soporta

export const env = {
  port: Number(process.env.PORT ?? 4000),

  // ⚠️ Si usas instancia nombrada, pon SQL_INSTANCE y omite port.
  // Si usas puerto fijo, pon SQL_PORT y NO pongas instanceName.
  sqlBase: {
  server: process.env.SQL_HOST!,
  user: process.env.SQL_USER!,
  password: process.env.SQL_PASSWORD!,
  options: {
    instanceName: process.env.SQL_INSTANCE, // ← importante
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: { max: 10, min: 1, idleTimeoutMillis: 30000 },
}
,                        // ✅ valida que coincide con mssql.config

  db1: process.env.SQL_DB1 ?? 'bdfichas',
  db2: process.env.SQL_DB2 ?? 'bdhistoriasclinicas',
};
