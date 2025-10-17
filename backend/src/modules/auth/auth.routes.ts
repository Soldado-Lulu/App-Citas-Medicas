import { Router } from 'express';
import * as ctrl from './auth.controller';

const r = Router();
r.post('/login', ctrl.login);   // POST /api/auth/login
r.get('/me', ctrl.me);          // opcional, luego protégelo con middleware
export default r;
