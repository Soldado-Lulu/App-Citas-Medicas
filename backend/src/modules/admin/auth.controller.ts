// backend/src/modules/admin/auth.controller.ts
import { Request, Response } from 'express';
import { pg } from '@/config/pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, palabraClave } = req.body as { email?: string; palabraClave?: string };
    if (!email || !palabraClave) return res.status(400).json({ ok:false, msg:'Faltan datos' });

    const q = await pg.query(
      'SELECT id, nombre, clave_hash, is_active FROM admins WHERE email=$1',
      [email.trim().toLowerCase()]
    );
    const a = q.rows[0];
    if (!a || !a.is_active) return res.status(401).json({ ok:false, msg:'No autorizado' });

    const ok = await bcrypt.compare(palabraClave, a.clave_hash);
    if (!ok) return res.status(401).json({ ok:false, msg:'Clave incorrecta' });

    const token = jwt.sign(
      { sub: a.id, role: 'admin', email: email.trim().toLowerCase(), name: a.nombre },
      process.env.JWT_SECRET || 'super-secreto',
      { expiresIn: '8h' }
    );

    res.json({ ok:true, token, profile: { id:a.id, email, nombre:a.nombre } });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message || 'Error' });
  }
}
