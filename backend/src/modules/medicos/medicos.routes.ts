// 📁 src/modules/especialidades/especialidades.routes.ts
import { Router } from 'express';
import {
  httpListMedicos,
  httpGetMedicos,
  httpListAllMedicos,
} from './medicos.controller';

const router = Router();
router.get('/ping', (_req, res) => res.json({ ok: true, where: 'medicos' }));
router.get('/', httpListMedicos);
router.get('/:idcuaderno', httpGetMedicos);
router.get('/all/list', httpListAllMedicos);
export default router;
