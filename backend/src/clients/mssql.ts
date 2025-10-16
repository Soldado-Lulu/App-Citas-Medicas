import sql from "mssql";

const sqlConfig: sql.config = {
  server: process.env.MSSQL_HOST!,        // 172.21.96.14
  database: process.env.MSSQL_DB!,        // SIAIS (o la que te dieron)
  user: process.env.MSSQL_USER!,          // sa (o usuario real)
  password: process.env.MSSQL_PASSWORD!,  // desarrollo_123
  options: { encrypt: false },            // según red; en hospital suele ser false
};

let pool: sql.ConnectionPool;

export async function getMssqlPool() {
  if (!pool) pool = await sql.connect(sqlConfig);
  return pool;
}
