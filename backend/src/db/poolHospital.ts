import 'dotenv/config';
import sql from 'mssql';

const config: sql.config = {
  server: process.env.HOSP_DB_SERVER!,
  options: {
    instanceName: process.env.HOSP_DB_INSTANCE,
    trustServerCertificate: true
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.HOSP_DB_USER!,
      password: process.env.HOSP_DB_PASSWORD!
    }
  },
  database: process.env.HOSP_DB_DATABASE!
};

let pool: sql.ConnectionPool | null = null;

export async function getHospitalPool() {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}
