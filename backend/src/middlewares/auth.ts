// backend/src/middlewares/auth.ts
/*
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
}*/

import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from './auth.middleware';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  verifyJWT(req, res, () => {
    if (!req.user) return res.status(401).json({ ok:false, msg: 'No autenticado' });
    next();
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  verifyJWT(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ ok: false, msg: 'Solo admin' });
    }
    next();
  });
}
