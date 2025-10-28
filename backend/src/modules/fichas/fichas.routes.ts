import { Router } from 'express';
import * as ctrl from './fichas.controller';

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
export default router;
