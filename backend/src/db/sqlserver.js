const baseConfig = {
  server: process.env.MSSQL_HOST,
  port: Number(process.env.MSSQL_PORT ?? 1433),
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERT === 'true',
    enableArithAbort: true,
    instanceName: process.env.MSSQL_INSTANCE || undefined
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
}
