import { Request, Response } from 'express';
import { inferirContextoMedico } from './context.repository';

export async function getMiContexto(req: Request, res: Response) {
  const user = req.user;
  if (!user?.idpersonal) return res.status(400).json({ ok:false, msg:'Falta idpersonal en token' });

  const ctx = await inferirContextoMedico(user.idpersonal);
  if (!ctx) return res.status(404).json({ ok:false, msg:'No se pudo inferir contexto' });

  res.json({ ok:true, contexto: ctx });
}
