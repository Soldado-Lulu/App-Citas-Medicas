import { Pool } from 'pg';

export const pg = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: (/^true$/i).test(String(process.env.PG_SSL || 'false'))
   ? { rejectUnauthorized: false }
    : undefined,
});
