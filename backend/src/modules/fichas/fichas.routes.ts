// src/modules/fichas/fichas.routes.ts
import { Router } from 'express';
import * as ctrl from './fichas.controller';
import { requireAuth } from '@/middlewares/auth';
import { getMiContexto } from './context.controller';
import { getMisSlots } from './slots.controller';
const router = Router();

// PERSONAS
router.get('/personas/matricula', ctrl.getTitularByMatricula);
router.get('/personas/:idpoblacion/afiliados', ctrl.getAfiliadosByTitular);
// ESPECIALIDADES / DOCTORES / SLOTS / CITAS
router.get('/especialidades', ctrl.getEspecialidades);
router.get('/doctores', ctrl.getDoctoresPorEspecialidad); // ?idcuaderno=...
router.get('/doctores/:idpersonal/slots', ctrl.getSlotsDoctor);
router.post('/citas/programada', ctrl.crearCitaDesdeFicha);
router.get('/grupo-info/:matricula', ctrl.getGrupoInfo);
router.get('/mi-contexto', requireAuth, getMiContexto);
router.get('/mis-slots',  requireAuth, getMisSlots);
export default router;
