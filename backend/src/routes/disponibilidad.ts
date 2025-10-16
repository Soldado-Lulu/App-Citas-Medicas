// backend/src/routes/disponibilidad.ts
import { Router } from 'express';
import { pg } from '../db/pg';
import { buildSlotsForWindow } from '../domain/slots';

export const disponibilidad = Router();

/**
 * GET /disponibilidad?fecha=YYYY-MM-DD
 * Respuesta:
 * [
 *   {
 *     medico: { id: number },
 *     slots: [{ start: ISO, end: ISO, libre: boolean }]
 *   },
 *   ...
 * ]
 */
disponibilidad.get('/', async (req, res) => {
  try {
    const fecha = String(req.query.fecha ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "Parámetro 'fecha' inválido (YYYY-MM-DD)" });
    }

    // 1) leer configuración de médicos y sus ventanas para el DOW
    // dow: 0=Dom .. 6=Sáb
    const dow = new Date(fecha + 'T00:00:00Z').getUTCDay();

    // médicos con su duración
    const medicosCfg = await pg.query<{
      medico_id: number;
      duracion_min: number;
    }>(`SELECT medico_id, duracion_min FROM medicos_cfg`);

    // ventanas del día
    const ventanas = await pg.query<{
      medico_id: number;
      start_hhmm: string;
      end_hhmm: string;
    }>(
      `SELECT medico_id, start_hhmm, end_hhmm
       FROM horarios_medico
       WHERE dow = $1
       ORDER BY medico_id, start_hhmm`,
      [dow]
    );

    // 2) slots ocupados de esa fecha (por médico)
    const startDay = fecha + 'T00:00:00Z';
    const endDay   = fecha + 'T23:59:59Z';
    const ocupadas = await pg.query<{
      medico_id: number;
      start_dt: string;
    }>(
      `SELECT medico_id, start_dt
       FROM citas
       WHERE estado = 'reservada'
         AND start_dt >= $1 AND start_dt <= $2`,
      [startDay, endDay]
    );

    // Map: medico_id -> Set<startISO> ocupados
    const occMap = new Map<number, Set<string>>();
    for (const row of ocupadas.rows) {
      const set = occMap.get(row.medico_id) ?? new Set<string>();
      set.add(new Date(row.start_dt).toISOString());
      occMap.set(row.medico_id, set);
    }

    // 3) construir respuesta
    const duracionPorMed = new Map<number, number>(
      medicosCfg.rows.map(r => [r.medico_id, r.duracion_min])
    );

    // group ventanas por médico
    const ventanasPorMed = new Map<number, Array<{ start_hhmm: string; end_hhmm: string }>>();
    for (const v of ventanas.rows) {
      const arr = ventanasPorMed.get(v.medico_id) ?? [];
      arr.push({ start_hhmm: v.start_hhmm, end_hhmm: v.end_hhmm });
      ventanasPorMed.set(v.medico_id, arr);
    }

    const respuesta = Array.from(ventanasPorMed.entries()).map(([medico_id, wins]) => {
      const step = duracionPorMed.get(medico_id) ?? 20;
      const allSlots = wins.flatMap(w =>
        buildSlotsForWindow(fecha, w.start_hhmm, w.end_hhmm, step)
      );
      const occ = occMap.get(medico_id) ?? new Set<string>();
      const slots = allSlots.map(s => ({
        start: s.start,
        end: s.end,
        libre: !occ.has(s.start),
      }));
      return { medico: { id: medico_id }, slots };
    });

    res.json(respuesta);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Error al calcular disponibilidad' });
  }
});
