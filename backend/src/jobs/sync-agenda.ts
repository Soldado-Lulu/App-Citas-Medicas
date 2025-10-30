import { getPool, sql } from '@/core/mssql';
import { pg } from '@/config/pg';

export async function syncSlots(desdeISO: string, hastaISO: string) {
  const pool = await getPool('db1'); // bdfichas
  const rs = await pool.request()
    .input('desde', sql.Date, new Date(desdeISO))
    .input('hasta', sql.Date, new Date(hastaISO))
    .query(`
      SELECT
        idfichaprogramada,
        idcuaderno,
        idestablecimiento,
        CAST(fip_fecha_ini AS date) AS fecha,
        CAST(fip_fecha_ini AS time) AS hora_inicio,
        CAST(fip_hora_fin  AS time) AS hora_fin,
        CASE WHEN fip_estado IN ('L','Disponible') THEN 'Disponible'
             WHEN fip_estado IN ('R','Reservado') THEN 'Reservado'
             ELSE 'Asignado' END AS fip_estado,
        idcobertura
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla
      WHERE fecha BETWEEN @desde AND @hasta
    `);

  const client = await pg.connect();
  try {
    await client.query('BEGIN');

    const upsertEst = `
      INSERT INTO app_establecimiento (idestablecimiento) VALUES ($1)
      ON CONFLICT (idestablecimiento) DO NOTHING
    `;
    const upsertCon = `
      INSERT INTO app_consultorio (idcuaderno, idestablecimiento)
      VALUES ($1,$2)
      ON CONFLICT (idcuaderno) DO UPDATE SET idestablecimiento = EXCLUDED.idestablecimiento
    `;
    const upsertSlot = `
      INSERT INTO app_slot (
        idfichaprogramada, idcuaderno, idestablecimiento, fecha, hora_inicio, hora_fin, fip_estado, idcobertura
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (idfichaprogramada) DO UPDATE SET
        idcuaderno        = EXCLUDED.idcuaderno,
        idestablecimiento = EXCLUDED.idestablecimiento,
        fecha             = EXCLUDED.fecha,
        hora_inicio       = EXCLUDED.hora_inicio,
        hora_fin          = EXCLUDED.hora_fin,
        fip_estado        = EXCLUDED.fip_estado,
        idcobertura       = EXCLUDED.idcobertura,
        sync_ts           = now()
    `;

    for (const row of rs.recordset) {
      await client.query(upsertEst, [row.idestablecimiento]);
      await client.query(upsertCon, [row.idcuaderno, row.idestablecimiento]);
      await client.query(upsertSlot, [
        row.idfichaprogramada,
        row.idcuaderno,
        row.idestablecimiento,
        row.fecha,
        row.hora_inicio,
        row.hora_fin,
        row.fip_estado,
        row.idcobertura ?? null
      ]);
    }
    await client.query('COMMIT');
    console.log(`✅ Sync: ${rs.recordset.length} slots`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Sync error', e);
  } finally {
    client.release();
  }
}

// Pequeño ejecutable (opcional)
if (require.main === module) {
  const hoy = new Date().toISOString().slice(0,10);
  const hasta = new Date(Date.now() + 1000*60*60*24*30).toISOString().slice(0,10);
  syncSlots(hoy, hasta).then(()=>process.exit(0));
}
