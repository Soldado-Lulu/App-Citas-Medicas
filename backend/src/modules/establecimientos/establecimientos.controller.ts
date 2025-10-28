// ────────────────────────────────────────────────────────────────────────────────
// 📁 src/modules/establecimientos/establecimientos.controller.ts
// Capa HTTP: parsea/valida entrada, traduce errores y coordina la respuesta
import type { Request, Response } from 'express';
import { z } from 'zod';
import { getEstablecimientoById, listEstablecimientos } from './establecimientos.repository';

export async function httpListEstablecimientos(req: Request, res: Response) {
  try {
    const { q, idempresa, idsucursal, page, limit, orderBy, order } = req.query;
    const result = await listEstablecimientos({
      q: typeof q === 'string' ? q : undefined,
      idempresa: idempresa ? Number(idempresa) : undefined,
      idsucursal: idsucursal ? Number(idsucursal) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      orderBy: (orderBy as any) || undefined,
      order: (order as any) || undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('List establecimientos error', err);
    res.status(500).json({ message: 'Error listando establecimientos' });
  }
}

export async function httpGetEstablecimiento(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });
    const item = await getEstablecimientoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (err) {
    console.error('Get establecimiento error', err);
    res.status(500).json({ message: 'Error obteniendo establecimiento' });
  }
}


