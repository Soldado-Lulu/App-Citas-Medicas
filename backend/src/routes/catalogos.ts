import { Router } from "express";
import { getMssqlPool } from "../clients/mssql";

export const catalogos = Router();

catalogos.get("/medicos", async (_, res) => {
  const pool = await getMssqlPool();
  // ⚠️ Ajusta nombres reales de tablas/columnas del HIS
  const r = await pool.request().query(`
    SELECT m.id, m.nombre, e.id AS especialidad_id, e.nombre AS especialidad
    FROM Medicos m
    LEFT JOIN Especialidades e ON e.id = m.especialidad_id
  `);
  res.json(r.recordset);
});

catalogos.get("/especialidades", async (_, res) => {
  const pool = await getMssqlPool();
  const r = await pool.request().query(`SELECT id, nombre FROM Especialidades`);
  res.json(r.recordset);
});
