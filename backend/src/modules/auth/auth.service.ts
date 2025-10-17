import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import * as repo from './auth.repository';

export async function loginByMatricula(matricula: string) {
  if (!matricula || !matricula.trim()) {
    const err: any = new Error('MATRICULA_REQUIRED');
    err.status = 400;
    throw err;
  }

  const user = await repo.findByMatricula(matricula);
  if (!user) {
    const err: any = new Error('NOT_FOUND');
    err.status = 404;
    throw err;
  }

  // arma un payload corto (no pongas datos sensibles)
  const payload = {
    sub: user.idpoblacion,
    mh: user.pac_numero_historia,
    emp: user.idempresa,
    est: user.idestablecimiento,
    name: [user.pac_nombre, user.pac_primer_apellido, user.pac_segundo_apellido]
      .filter(Boolean).join(' '),
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' });

  // responde lo que el front necesite
  return {
    token,
    user: {
      idpoblacion: user.idpoblacion,
      matricula: user.pac_numero_historia,
      codigo: user.pac_codigo,
      nombre: user.pac_nombre,
      primer_apellido: user.pac_primer_apellido,
      segundo_apellido: user.pac_segundo_apellido,
      idempresa: user.idempresa,
      idestablecimiento: user.idestablecimiento,
      idsexo: user.idsexo,
      documento: user.pac_documento_id,
      fecha_nac: user.pac_fecha_nac
    }
  };
}
