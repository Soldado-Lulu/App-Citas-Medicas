import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { contarMisSlots, listarMisSlots,reservarSlot } from './slots-user.controller';

const r = Router();

// El usuario debe estar logueado (JWT). Usamos su matrícula del token (mh).
r.get('/mis-slots/contador', requireAuth, contarMisSlots);
r.get('/mis-slots',          requireAuth, listarMisSlots);
// 👇 NUEVO: reservar
// POST /api/citas/slots/:idFicha/reservar   body: { idpoblacion?: number }
// Si no mandas idpoblacion en el body, lo tomamos del token (req.user.sub)
r.post('/slots/:idFicha/reservar', requireAuth, reservarSlot);
export default r;
