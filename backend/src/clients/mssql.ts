import sql from "mssql";

const config: sql.config = {
  server: process.env.MSSQL_SERVER || "172.21.96.14",     // IP
  database: process.env.MSSQL_DB || "bdingresos",         // la base donde están esas tablas/vistas
  user: process.env.MSSQL_USER || "sa",
  password: process.env.MSSQL_PWD || "desarrollo_123",
  options: {
    encrypt: false,           // en LAN suele ser false
    trustServerCertificate: true,
    instanceName: process.env.MSSQL_INSTANCE || "SIAIS",  // tu instancia: 172.21.96.14\SIAIS
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

export { sql };
