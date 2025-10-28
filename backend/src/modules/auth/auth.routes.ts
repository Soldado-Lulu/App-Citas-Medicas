// backend/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { login, me } from './auth.controller';
import { verifyJWT } from '@/middlewares/auth.middleware'; // usa el nuevo
const r = Router();

r.post('/login', login);
r.get('/me', verifyJWT, me);

export default r;
