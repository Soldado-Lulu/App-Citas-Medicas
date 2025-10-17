// src/modules/historias/historias.routes.ts
import { Router } from 'express';
import * as ctrl from './historias.controller';

const r = Router();
r.get('/poblacion', ctrl.getPoblacion);
export default r;
