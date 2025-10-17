import { Router } from 'express';
import * as ctrl from './fichas.controller';

const router = Router();

// GET /api/fichas?q=...&page=1&size=20&idempresa=2&idestablecimiento=120
router.get('/', ctrl.listarFichas);

// GET /api/fichas/45
router.get('/:id', ctrl.getFicha);

export default router;
