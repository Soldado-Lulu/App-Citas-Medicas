// src/modules/historias/historias.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as repo from './historias.repository';

export async function getPoblacion(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await repo.obtenerDatosPoblacion({
      i_tipo: (req.query.tipo as any) ?? '1',
      i_idpoblacion: req.query.idpoblacion ? Number(req.query.idpoblacion) : undefined,
      i_idempresa: req.query.idempresa ? Number(req.query.idempresa) : undefined,
      i_fecha_edad: req.query.fecha_edad as string | undefined,
      i_fecha_actual: req.query.fecha_actual as string | undefined,
    });
    res.json({ rows: data });
  } catch (e) { next(e); }
}
