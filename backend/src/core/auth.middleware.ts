import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ ok:false, message:'NO_TOKEN' });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    // @ts-ignore
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ ok:false, message:'INVALID_TOKEN' });
  }
}
