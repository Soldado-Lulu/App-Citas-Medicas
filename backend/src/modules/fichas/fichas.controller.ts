import { Request, Response, NextFunction } from 'express';
import * as repo from './fichas.repository';

export async function listarFichas(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 20);
    const q = String(req.query.q ?? '');
    const idempresa = req.query.idempresa ? Number(req.query.idempresa) : undefined;
    const idestablecimiento = req.query.idestablecimiento ? Number(req.query.idestablecimiento) : undefined;

    const rows = await repo.listarFichas(q, page, size, idempresa, idestablecimiento);

    res.json({
      ok: true,
      page,
      size,
      count: rows.length, // si luego quieres total real, hacemos COUNT(*) en un segundo query
      rows
    });
  } catch (e) { next(e); }
}

export async function getFicha(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const row = await repo.getFichaById(id);
    if (!row) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.json({ ok: true, row });
  } catch (e) { next(e); }
}
