import { Router } from 'express';
import { getHospitalPool } from '../db/poolHospital.js';

export const personas = Router();

/** GET /personas?matricula=12345
 *  Devuelve titular + afiliados (hijo/esposa)
 */
personas.get('/personas', async (req, res) => {
  const matricula = String(req.query.matricula || '').trim();
  if (!matricula) return res.status(400).json({ error: 'matricula requerida' });

  const pool = await getHospitalPool();

  // 1) titular
  const tit = await pool.request()
    .input('mat', matricula)
    .query(`
      SELECT id AS id, nombre AS name, 'Titular' AS relation, 1 AS isTitular
      FROM dbo.asegurados
      WHERE matricula = @mat
    `);

  if (tit.recordset.length === 0) return res.json([]);

  const titular = tit.recordset[0];

  // 2) afiliados
  const af = await pool.request()
    .input('titularId', titular.id)
    .query(`
      SELECT id AS id, nombre AS name, relacion AS relation, 0 AS isTitular
      FROM dbo.afiliados
      WHERE titular_id=@titularId
    `);

  res.json([titular, ...af.recordset]);
});
