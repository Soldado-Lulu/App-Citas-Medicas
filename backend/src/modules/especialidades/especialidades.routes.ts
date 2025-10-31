import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import {
  getEspecialidadesPorEstablecimiento,
  getDisponibilidadPorDia,
  getSlotsLibresPorFecha,
  reservarPorEspecialidad,
} from './especialidades.controller';

const r = Router();

/** GET /api/especialidades?idest=120&buscar=MEDI */
r.get('/', requireAuth, getEspecialidadesPorEstablecimiento);

/** GET /api/especialidades/:idcuaderno/disponibilidad?idest=120&desde=YYYY-MM-DD&hasta=YYYY-MM-DD */
r.get('/:idcuaderno/disponibilidad', requireAuth, getDisponibilidadPorDia);

/** GET /api/especialidades/:idcuaderno/slots?idest=120&fecha=YYYY-MM-DD */
r.get('/:idcuaderno/slots', requireAuth, getSlotsLibresPorFecha);

/** POST /api/especialidades/:idcuaderno/reservar  body: { idfichaprogramada, idpoblacion? } */
r.post('/:idcuaderno/reservar', requireAuth, reservarPorEspecialidad);

export default r;
