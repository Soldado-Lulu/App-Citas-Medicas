// backend/src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { adminLogin } from './auth.controller';
import { requireAdmin } from '@/middlewares/auth';

const r = Router();

r.post('/auth/login', adminLogin);
r.get('/me', requireAdmin, (req, res) => {
  res.json({ ok:true, me: (req as any).user });
});

export default r;
