// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from './auth.middleware';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Primero verificamos el token
  verifyJWT(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ ok: false, msg: 'Solo admin' });
    }
    next();
  });
}
