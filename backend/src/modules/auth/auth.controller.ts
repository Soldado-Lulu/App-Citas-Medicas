import { Request, Response, NextFunction } from 'express';
import * as svc from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { matricula } = req.body as { matricula: string };
    const data = await svc.loginByMatricula(String(matricula ?? ''));
    res.json({ ok: true, ...data });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ ok: false, message: e.message });
    next(e);
  }
}

// opcional: endpoint para validar token y leer payload
export async function me(req: Request, res: Response) {
  // si luego agregas middleware de auth, aquí solo devolverías req.user
  res.json({ ok: true, message: 'todo ok (pendiente middleware)' });
}
