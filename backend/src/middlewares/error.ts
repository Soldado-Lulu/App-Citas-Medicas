// error.ts
import { NextFunction, Request, Response } from 'express';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({ ok: false, message: 'Internal error' });
}
