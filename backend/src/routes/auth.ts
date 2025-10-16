import { Router } from "express";
import { getMssqlPool } from "../clients/mssql";

export const auth = Router();

auth.post("/login", async (req, res) => {
  const { matricula } = req.body as { matricula: string };
  if (!matricula) return res.status(400).send("Falta matrícula");

  const pool = await getMssqlPool();
  // ⚠️ CAMBIA esta consulta por la real en tu HIS
  const result = await pool.request()
    .input("matricula", matricula)
    .query(`
      SELECT TOP 1
        idAsegurado   AS id,
        nombreCompleto AS name,
        'user'        AS role,     -- o la lógica real
        matricula
      FROM Asegurados
      WHERE matricula = @matricula
    `);

  const user = result.recordset[0];
  if (!user) return res.status(401).send("Credenciales inválidas");

  res.json({ token: "mock-token", user });
});
