// src/modules/auth/auth.controller.ts
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { findByMatricula, findIdPersonalByCI } from './auth.repository'; // 👈 nombre correcto

// Normaliza el row de SQL a tu "User" del frontend
function toUser(row: any) {
  const nombre =
    [row?.pac_nombre, row?.pac_primer_apellido, row?.pac_segundo_apellido]
      .filter(Boolean)
      .join(' ')
      .trim();

  return {
    idpoblacion: row.idpoblacion,
    matricula: row.pac_numero_historia ?? row.pac_codigo ?? '',
    codigo: row.pac_codigo ?? undefined,
    nombre: row.pac_nombre ?? '',
    primer_apellido: row.pac_primer_apellido ?? '',
    segundo_apellido: row.pac_segundo_apellido ?? '',
    idempresa: row.idempresa ?? null,
    idestablecimiento: row.idestablecimiento ?? null,
    nombre_completo: nombre,
  };
}

export async function loginByMatricula(req: Request, res: Response) {
  const { matricula } = req.body as { matricula?: string };
  if (!matricula) return res.status(400).json({ ok: false, msg: 'Falta matrícula' });

  const row = await findByMatricula(matricula);           // 👈 usa la función correcta
  if (!row) return res.status(404).json({ ok: false, msg: 'Matrícula no encontrada' });

  const user = toUser(row);

  // (opcional) si quieres mapear idpersonal a partir del CI del titular
  const idpersonal = await findIdPersonalByCI(row.pac_documento_id);

  const payload = {
    sub: user.idpoblacion,            // 🔑 usado por requireAuth
    matricula: user.matricula,
    nombre: user.nombre_completo,
    idpersonal,                       // opcional
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' });

  return res.json({ ok: true, data: { user, token } });
}

export async function me(req: Request, res: Response) {
  // requireAuth ya decodifica el JWT y pone req.user
  return res.json({ ok: true, data: { userId: req.user?.sub, matricula: req.user?.matricula } });
}
