// backend/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { loginByMatricula, me } from './auth.controller';
import { requireAuth } from '@/middlewares/auth';

const r = Router();
r.post('/login', loginByMatricula);
r.get('/me', requireAuth, me);

export default r;


