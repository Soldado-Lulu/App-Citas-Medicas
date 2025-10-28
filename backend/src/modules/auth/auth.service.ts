/*import jwt from 'jsonwebtoken';
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
*/import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import * as repo from './auth.repository';
import { inferirContextoMedico } from '@/modules/fichas/context.repository'; // 👈 NUEVO

export async function loginByMatricula(matricula: string) {
  if (!matricula || !matricula.trim()) {
    const err: any = new Error('MATRICULA_REQUIRED');
    err.status = 400;
    throw err;
  }

  // 1) Usuario por matrícula (paciente)
  const user = await repo.findByMatricula(matricula);
  if (!user) {
    const err: any = new Error('NOT_FOUND');
    err.status = 404;
    throw err;
  }

  // 2) (Opcional) Detectar si también es MÉDICO y derivar contexto sin escribir en SQL Server
  //    Estrategia rápida: buscar idpersonal por documento (CI) o por matrícula profesional si la tienes
  let idpersonal: number | undefined;
  try {
    // Implementa en el repo una búsqueda simple en hcl_personal_salud por CI del paciente:
    // SELECT TOP 1 idpersonalmedico FROM bdhistoriasclinicas.dbo.hcl_personal_salud WHERE ci = @doc
    idpersonal = await repo.findIdPersonalByCI(user.pac_documento_id); // 👈 NUEVO (ver abajo)
  } catch {
    idpersonal = undefined;
  }

  // 3) Inferir consultorio (idc) e idestablecimiento (est) SOLO si es médico
  let idc: number | null = null;
  let est = user.idestablecimiento ?? null;

  if (idpersonal) {
    const ctx = await inferirContextoMedico(idpersonal); // lee de la vista de fichas programadas
    if (ctx) {
      idc = ctx.idcuaderno;
      // si el “est” del usuario (paciente) está vacío, usa el del contexto del médico
      est = (est ?? ctx.idestablecimiento) ?? null;
    }
  }

  // 4) Payload corto, sin datos sensibles
  const payload = {
    sub: user.idpoblacion,               // id interno paciente
    mh: user.pac_numero_historia,        // matrícula historia
    emp: user.idempresa,                 // empresa
    est: est ?? undefined,               // establecimiento (puede venir de usuario o contexto)
    name: [user.pac_nombre, user.pac_primer_apellido, user.pac_segundo_apellido]
           .filter(Boolean).join(' '),
    role: 'user',                        // o lo que uses (si es médico puedes poner 'medico')
    idpersonal: idpersonal ?? undefined, // 👈 id del médico (si aplica)
    idc: idc ?? undefined,               // 👈 consultorio (si aplica)
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' });

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
      idestablecimiento: est,            // 👈 devuelve el est ya resuelto
      idsexo: user.idsexo,
      documento: user.pac_documento_id,
      fecha_nac: user.pac_fecha_nac,
      idpersonal: idpersonal ?? null,    // 👈 expón por si el front lo necesita
      idcuaderno: idc ?? null            // 👈 idem
    }
  };
}
