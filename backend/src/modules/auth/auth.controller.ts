// backend/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as svc from './auth.service';
import * as disabledRepo from '@/modules/admin/disabledEst.repository';

// Login de USUARIO por matrícula.
// Si su establecimiento está en la lista de deshabilitados (en PG), devolvemos 403.
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { matricula } = req.body as { matricula: string };
    const data = await svc.loginByMatricula(String(matricula ?? ''));

    const estId = data?.user?.idestablecimiento;
    if (typeof estId === 'number') {
      const blocked = await disabledRepo.isDisabled(estId);
      if (blocked) {
        res.status(403).json({
          ok: false,
          message: 'Tu establecimiento no está habilitado. Contacta al administrador.',
        });
        return;
      }
    }

    res.json({ ok: true, ...data });
  } catch (e: any) {
    if (e?.status) {
      res.status(e.status).json({ ok: false, message: e.message });
      return;
    }
    next(e);
  }
}

// /api/auth/me (protegido con middleware JWT)
// Devuelve si el establecimiento del token está bloqueado.
export async function me(req: Request, res: Response): Promise<void> {
  const payload = (req as any).user as { est?: number; [k: string]: any };
  const blocked =
    typeof payload?.est === 'number' ? await disabledRepo.isDisabled(payload.est) : false;

  res.json({
    ok: true,
    user: payload,
    blocked,
    message: blocked ? 'Tu establecimiento no está habilitado.' : 'ok',
  });
}
