import { pg } from '@/config/pg';

/** Crea reserva local (estado 'pendiente'). Devuelve {id, estado} o null si ya existe. */
export async function crearReservaLocal(idpoblacion: number, idfichaprogramada: number) {
  const q = `
    INSERT INTO app_reserva (idpoblacion, idfichaprogramada, estado)
    VALUES ($1, $2, 'pendiente')
    ON CONFLICT (idfichaprogramada) DO NOTHING
    RETURNING id, estado, creada_ts
  `;
  const { rows } = await pg.query(q, [idpoblacion, idfichaprogramada]);
  return rows[0] ?? null;
}
