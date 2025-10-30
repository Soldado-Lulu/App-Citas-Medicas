import { Router } from 'express';
import {
  getDoctoresDisponibles,
  getSlotsMgMf,
  postCrearCita,
} from './agendar.controller';

const router = Router();

/**
 * GET /api/agendar/doctores?idest=120&fecha=YYYY-MM-DD
 * Lista doctores con fichas libres (solo MG/MF) en el establecimiento indicado.
 */
router.get('/doctores', getDoctoresDisponibles);

/**
 * GET /api/agendar/slots?idpersonal=7&idest=120&fecha=YYYY-MM-DD[&idconsultorio=24]
 * Lista slots disponibles (solo MG/MF) para un doctor en el establecimiento indicado.
 * Si se pasa idconsultorio, filtra por ese consultorio asignado.
 */
router.get('/slots', getSlotsMgMf);

/**
 * POST /api/agendar
 * Body: { idfichaprogramada:number, idpoblacion:number, idest:number }
 * Crea la cita si la ficha está disponible, es MG/MF y del mismo establecimiento.
 */
router.post('/', postCrearCita);

export default router;
