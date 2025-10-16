import { Router } from 'express';
import { pg } from '../db/poolApp.js';
import { getHospitalPool } from '../db/poolHospital.js';
import { buildSlotsForWindow } from '../domain/slots.js';
import { z } from 'zod';

export const citas = Router();

/** GET /disponibilidad?fecha=YYYY-MM-DD */
citas.get('/disponibilidad', async (req, res) => {
  const fecha = String(req.query.fecha || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return res.status(400).json({ error: 'fecha inválida' });

  const dow = new Date(`${fecha}T00:00:00Z`).getUTCDay(); // 0..6

  // Medicos con horarios ese día
  const hs = await pg.query(
    `SELECT h.medico_id, h.start_hhmm, h.end_hhmm, m.duracion_min
     FROM horarios_medico h
     JOIN medicos_cfg m ON m.medico_id=h.medico_id
     WHERE h.dow=$1`, [dow]
  );

  // Ocupación
  const ini = new Date(`${fecha}T00:00:00Z`);
  const fin = new Date(`${fecha}T23:59:59Z`);
  const oc = await pg.query(
    `SELECT medico_id, start_dt
     FROM citas
     WHERE start_dt BETWEEN $1 AND $2
       AND estado='reservada'`, [ini, fin]
  );
  const ocByMed = new Map<number, Set<string>>();
  for (const r of oc.rows) {
    const key = new Date(r.start_dt).toISOString();
    if (!ocByMed.has(r.medico_id)) ocByMed.set(r.medico_id, new Set());
    ocByMed.get(r.medico_id)!.add(key);
  }

  // Nombres / especialidad desde hospital (AJUSTA a tus tablas reales)
  const hospital = await getHospitalPool();
  const medInfo = await hospital.request().query(`
    SELECT m.id AS id, m.nombre, e.nombre AS especialidad
    FROM dbo.medicos m
    LEFT JOIN dbo.especialidades e ON e.id = m.especialidad_id
  `);
  const info = new Map<number, {nombre:string, especialidad:string}>();
  for (const r of medInfo.recordset) info.set(r.id, { nombre: r.nombre, especialidad: r.especialidad });

  const out: any[] = [];
  for (const row of hs.rows) {
    const slots = buildSlotsForWindow(`${fecha}T00:00:00Z`, row.start_hhmm, row.end_hhmm, row.duracion_min)
      .map(s => ({ ...s, libre: !ocByMed.get(row.medico_id)?.has(s.start) }));
    const mi = info.get(row.medico_id) || { nombre: `ID ${row.medico_id}`, especialidad: '—' };
    out.push({ medico: { id: row.medico_id, ...mi }, slots });
  }
  res.json(out);
});

const createSchema = z.object({
  person_id: z.number(),
  person_name: z.string().optional(),
  relation: z.string().optional(),
  booked_by: z.number(),
  medico_id: z.number(),
  start: z.string(), // ISO
  end: z.string()
});

/** POST /citas (regla: 1 por persona por día) */
citas.post('/citas', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { person_id, person_name, relation, booked_by, medico_id, start, end } = parsed.data;

  try {
    const r = await pg.query(
      `INSERT INTO citas(person_id, person_name, relation, booked_by, medico_id, start_dt, end_dt, estado)
       VALUES($1,$2,$3,$4,$5,$6,$7,'reservada')
       RETURNING *`,
      [person_id, person_name ?? null, relation ?? null, booked_by, medico_id, new Date(start), new Date(end)]
    );
    res.status(201).json(r.rows[0]);
  } catch (e: any) {
    // Si rompe por el índice único parcial: ya tiene cita ese día
    if (String(e?.message || '').includes('uq_citas_person_day')) {
      return res.status(400).json({ error: 'Esta persona ya tiene una cita ese día.' });
    }
    // Si rompe por colisión exacta de slot/medico (IX más arriba) → otro mensaje
    if (String(e?.message || '').includes('ix_citas_medico_start')) {
      return res.status(400).json({ error: 'El horario ya fue tomado.' });
    }
    console.error(e);
    res.status(500).json({ error: 'No se pudo crear la cita.' });
  }
});

/** GET /citas?titular_id=...  (simple: trae todas ordenadas) */
citas.get('/citas', async (_req, res) => {
  const r = await pg.query(`SELECT * FROM citas ORDER BY start_dt DESC`);
  res.json(r.rows);
});
