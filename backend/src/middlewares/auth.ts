import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ ok:false, msg:'Token faltante' });

  try {
    const p = jwt.verify(token, process.env.JWT_SECRET || 'super-secreto') as any;
    if (p.role !== 'admin') return res.status(403).json({ ok:false, msg:'Solo admin' });
    (req as any).user = p;
    next();
  } catch {
    res.status(401).json({ ok:false, msg:'Token inválido' });
  }
}
