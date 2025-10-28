import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { contarMisSlots, listarMisSlots } from './slots-user.controller';

const r = Router();

// El usuario debe estar logueado (JWT). Usamos su matrícula del token (mh).
r.get('/mis-slots/contador', requireAuth, contarMisSlots);
r.get('/mis-slots',          requireAuth, listarMisSlots);

export default r;
