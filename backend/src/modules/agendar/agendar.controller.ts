import { Request, Response } from 'express';
import sql from 'mssql';
import { listDoctoresDisponibles, listSlotsMgMf, validarFichaMgMfYCrearCita } from './agendar.repository';

export async function getDoctoresDisponibles(req: Request, res: Response) {
  try {
    const { idest, fecha } = req.query as any;
    if (!idest || !fecha) return res.status(400).json({ ok:false, msg:'Faltan idest o fecha' });

    const rows = await listDoctoresDisponibles(String(fecha), Number(idest));
    res.json({ ok:true, count: rows.length, doctores: rows });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
  
}

export async function getSlotsMgMf(req: Request, res: Response) {
  try {
    const { idpersonal, idest, fecha, idconsultorio } = req.query as any;
    if (!idpersonal || !idest || !fecha) {
      return res.status(400).json({ ok:false, msg:'Faltan idpersonal, idest o fecha' });
    }

    const rows = await listSlotsMgMf(
      Number(idpersonal),
      String(fecha),
      Number(idest),
      idconsultorio ? Number(idconsultorio) : null
    );

    res.json({ ok:true, count: rows.length, slots: rows });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}

export async function postCrearCita(req: Request, res: Response) {
  try {
    const { idfichaprogramada, idpoblacion, idest } = req.body as { idfichaprogramada:number; idpoblacion:number; idest:number; };
    if (!idfichaprogramada || !idpoblacion || !idest) {
      return res.status(400).json({ ok:false, msg:'Faltan idfichaprogramada, idpoblacion o idest' });
    }

    const result = await validarFichaMgMfYCrearCita(idfichaprogramada, idpoblacion, idest);
    if (!result.ok) return res.status(result.status ?? 409).json(result);

    res.status(201).json(result);
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}
