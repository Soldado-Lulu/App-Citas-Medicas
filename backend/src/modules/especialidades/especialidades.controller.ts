import { Request, Response } from 'express';
import {
  listarEspecialidades,
  contarLibresPorDia,
  listarLibresEnFecha,
  getFichaPorId,
} from './especialidades.repository';
import { crearReservaLocal } from '@/modules/citas/reservas.repository';
import { slotSigueLibreSQLServer } from '@/modules/citas/validate-slot-sqlserver';

export async function getEspecialidadesPorEstablecimiento(req: Request, res: Response) {
  const { idest, buscar } = req.query as { idest?: string; buscar?: string };
  if (!idest) return res.status(400).json({ ok:false, msg:'Falta ?idest' });

  const rows = await listarEspecialidades(Number(idest), buscar || '');
  return res.json({ ok:true, data: rows });
}

export async function getDisponibilidadPorDia(req: Request, res: Response) {
  const { idcuaderno } = req.params as any;
  const { idest, desde, hasta } = req.query as { idest?: string; desde?: string; hasta?: string };
  if (!idest || !desde) return res.status(400).json({ ok:false, msg:'Faltan ?idest y ?desde (YYYY-MM-DD)' });

  const data = await contarLibresPorDia(Number(idcuaderno), Number(idest), desde, hasta);
  return res.json({ ok:true, data });
}

export async function getSlotsLibresPorFecha(req: Request, res: Response) {
  const { idcuaderno } = req.params as any;
  const { idest, fecha } = req.query as { idest?: string; fecha?: string };
  if (!idest || !fecha) return res.status(400).json({ ok:false, msg:'Faltan ?idest y ?fecha (YYYY-MM-DD)' });

  const data = await listarLibresEnFecha(Number(idcuaderno), Number(idest), fecha);
  return res.json({ ok:true, data });
}

export async function reservarPorEspecialidad(req: Request, res: Response) {
  const { idcuaderno } = req.params as any;
  const { idfichaprogramada, idpoblacion } = req.body as { idfichaprogramada?: number; idpoblacion?: number };

  if (!idfichaprogramada) return res.status(400).json({ ok:false, msg:'Falta idfichaprogramada' });
  const sub = req.user?.sub as number | undefined;
  const idPac = idpoblacion ?? sub;
  if (!idPac) return res.status(400).json({ ok:false, msg:'Falta idpoblacion (o token sin sub)' });

  // 1) Validar que la ficha pertenece a ese cuaderno y está libre en la vista
  const ficha = await getFichaPorId(idfichaprogramada);
  if (!ficha) return res.status(404).json({ ok:false, msg:'Ficha no encontrada' });
  if (Number(ficha.idcuaderno) !== Number(idcuaderno))
    return res.status(400).json({ ok:false, msg:'La ficha no corresponde a la especialidad/cuaderno' });

  // 2) Validar estado “libre” en origen (tabla base)
  const sigueLibre = await slotSigueLibreSQLServer(idfichaprogramada);
  if (!sigueLibre) return res.status(409).json({ ok:false, msg:'El horario ya no está disponible' });

  // 3) Registrar reserva local en Postgres (ON CONFLICT evita doble-reserva)
  const reserva = await crearReservaLocal(idPac, idfichaprogramada);
  if (!reserva) return res.status(409).json({ ok:false, msg:'El horario ya fue tomado localmente' });

  return res.json({ ok:true, msg:'Reserva registrada (pendiente de confirmación)', reserva, ficha });
}
