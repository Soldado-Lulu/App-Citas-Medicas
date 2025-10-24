// backend/src/modules/admin/disabledEst.routes.ts
import { Router } from 'express';
import * as repo from './disabledEst.repository';
import { requireAdmin } from '@/middlewares/auth'; // tu middleware admin

const r = Router();

r.get('/establecimientos/disabled', requireAdmin, async (_req, res, next) => {
  try { res.json({ ok: true, ids: await repo.listDisabled() }); }
  catch (e) { next(e); }
});

r.patch('/establecimientos/:id/disabled', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { disabled } = req.body as { disabled: boolean };
    if (!id || typeof disabled !== 'boolean') {
      return res.status(400).json({ ok: false, message: 'Parámetros inválidos' });
    }
    const by = String((req as any).user?.sub ?? 'admin');
    await repo.setDisabled(id, disabled, by);
    res.json({ ok: true, id, disabled });
  } catch (e) { next(e); }
});

export default r;
