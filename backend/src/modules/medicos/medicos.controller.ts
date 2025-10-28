// 📁 src/modules/especialidades/especialidades.controller.ts
import type { Request, Response } from 'express';
import { listMedicos, getMedicosById,listAllMedicos } from './medicos.repository';

export async function httpListMedicos(req: Request, res: Response) {
  try {
    const { q, page, limit, orderBy, order } = req.query;
    const result = await listMedicos({
      q: typeof q === 'string' ? q : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      orderBy: (orderBy as any) || undefined,
      order: (order as any) || undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('List Medicos error:', err);
    res.status(500).json({ message: 'Error listando Medicos' });
  }
}

export async function httpGetMedicos(req: Request, res: Response) {
  try {
    const id = Number(req.params.idcuaderno);
    if (!id || Number.isNaN(id))
      return res.status(400).json({ message: 'idcuaderno inválido' });

    const item = await getMedicosById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (err) {
    console.error('Get Medicos error:', err);
    res.status(500).json({ message: 'Error obteniendo Medicos' });
  }
}

export async function httpListAllMedicos(_req: Request, res: Response) {
  try {
    const items = await listAllMedicos();
    res.json(items);
  } catch (err) {
    console.error('List all Medicos error:', err);
    res.status(500).json({ message: 'Error listando todas las Medicos' });
  }
}
