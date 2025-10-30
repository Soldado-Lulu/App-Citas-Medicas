import { Request, Response } from 'express';
import { getConsultorioDePaciente } from './user-consultorio.repository';
import { contarSlotsLibresPorDia, listarSlotsLibres } from './slots-user.repository';
import {crearReservaLocal} from './reservas.repository';
import { slotSigueLibreSQLServer } from './validate-slot-sqlserver';
/**
 * GET /api/citas/mis-slots/contador?fecha=YYYY-MM-DD
 * GET /api/citas/mis-slots/contador?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Resumen de CUÁNTOS horarios libres hay en el consultorio del usuario.
 */
export async function contarMisSlots(req: Request, res: Response) {
  const user = req.user; // sub= idpoblacion, mh = matricula
  const { fecha, desde, hasta } = req.query as { fecha?: string; desde?: string; hasta?: string };

  if (!user?.mh) return res.status(400).json({ ok:false, msg:'Token sin matrícula (mh)' });

  // 1) Derivar consultorio del usuario:
  const ctx = await getConsultorioDePaciente(String(user.mh));
  if (!ctx) return res.status(404).json({ ok:false, msg:'No se pudo determinar consultorio para el usuario' });

  // 2) Rango (si no envías 'desde'/'hasta', usa 'fecha')
  const f1 = desde || fecha;
  const f2 = hasta || (fecha ?? undefined);
  if (!f1) return res.status(400).json({ ok:false, msg:'Falta fecha o desde' });

  const resumen = await contarSlotsLibresPorDia(ctx.idcuaderno, ctx.idestablecimiento, f1, f2);
  const total = resumen.reduce((acc, r) => acc + Number(r.libres), 0);

  res.json({ ok:true, consultorio: ctx, total, porDia: resumen });
}

/**
 * GET /api/citas/mis-slots?fecha=YYYY-MM-DD
 * Lista de HORAS libres de ese día en el consultorio del usuario.
 */
export async function listarMisSlots(req: Request, res: Response) {
  const user = req.user;
  const { fecha } = req.query as { fecha?: string };
  if (!user?.mh) return res.status(400).json({ ok:false, msg:'Token sin matrícula (mh)' });
  if (!fecha)   return res.status(400).json({ ok:false, msg:'Falta fecha' });

  const ctx = await getConsultorioDePaciente(String(user.mh));
  if (!ctx) return res.status(404).json({ ok:false, msg:'No se pudo determinar consultorio para el usuario' });

  const filas = await listarSlotsLibres(ctx.idcuaderno, ctx.idestablecimiento, fecha);
  res.json({
    ok: true,
    consultorio: ctx,
    count: filas.length,
    slots: filas.map(f => f.hora),
    fichas: filas,
  });
}
export async function reservarSlot(req: Request, res: Response) {
  try {
    const user = req.user;
    const idFicha = Number(req.params.idFicha);
    const idpoblacion = Number(req.body?.idpoblacion ?? user?.sub); // del token por defecto

    if (!idFicha || !idpoblacion) {
      return res.status(400).json({ ok:false, msg:'idFicha e idpoblacion requeridos' });
    }

    // 1) Validar en VIVO contra SQL Server que el slot siga libre
    const libre = await slotSigueLibreSQLServer(idFicha);
    if (!libre) {
      return res.status(409).json({ ok:false, msg:'El horario ya no está disponible' });
    }

    // 2) Guardar reserva local en Postgres (pendiente)
    const reserva = await crearReservaLocal(idpoblacion, idFicha);
    if (!reserva) {
      return res.status(409).json({ ok:false, msg:'El horario ya fue tomado localmente' });
    }

    return res.json({
      ok: true,
      msg: 'Reserva registrada (pendiente de confirmación en origen)',
      reserva,
    });
  } catch (e:any) {
    console.error(e);
    return res.status(500).json({ ok:false, msg:'Error al reservar', detail: e.message });
  }
}