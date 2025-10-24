// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as LibJwtPayload } from 'jsonwebtoken';
import { env } from '@/config/env';

// ⚠️ ¡No llames a tu tipo igual que el de jsonwebtoken!
// Creamos un tipo que *extiende* el de la librería.
export type AppJwtPayload = LibJwtPayload & {
  sub: number;   // nosotros garantizamos número en nuestro token
  est?: number;  // id establecimiento, si lo incluyes en el token
  role?: string; // opcional: 'admin' | 'user'
};

// (opcional pero recomendado) añade el tipo a Express.Request para evitar "as any"
declare global {
  namespace Express {
    interface Request {
      user?: AppJwtPayload;
    }
  }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, message: 'No autorizado' });

  try {
    // verify puede devolver string | JwtPayload; nosotros afirmamos nuestro payload
    const decoded = jwt.verify(token, env.jwtSecret) as AppJwtPayload | string;

    // Si alguna vez firmaste un string (no objeto), rechaza o parsea
    if (typeof decoded === 'string') {
      return res.status(401).json({ ok: false, message: 'Token inválido' });
    }

    // Normalmente será objeto
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
}
