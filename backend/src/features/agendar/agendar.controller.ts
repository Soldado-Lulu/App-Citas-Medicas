// src/features/agendar/agendar.controller.ts
import { Request, Response } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { execQuery } from '@/config/db';
import { pg } from '@/config/pg'; // Ajusta a tu helper/cliente de Postgres

dayjs.extend(utc); dayjs.extend(tz);
const TZ = 'America/La_Paz';

function getWindow() {
  const today = dayjs().tz(TZ).startOf('day');
  const d1 = today.add(1, 'day').format('YYYY-MM-DD');
  const d2 = today.add(2, 'day').format('YYYY-MM-DD');
  return { d1, d2, set: new Set([d1, d2]) };
}

export async function listEspecialidades(req: Request, res: Response) {
  const { idest } = req.query as any;
  const sql = `
    DECLARE @FECHA1 DATE = CONVERT(date, DATEADD(day, 1, GETDATE()));
    DECLARE @FECHA2 DATE = CONVERT(date, DATEADD(day, 2, GETDATE()));
    SELECT ef.fic_descripcion AS especialidad, COUNT(*) AS cupos
    FROM bdhistoriasclinicas..ErpFichas ef
    JOIN bdfichas..fic_fichas_programadas_pantalla fp
      ON fp.idfichaprogramada = ef.idfichaprogramada
    WHERE ef.idestablecimiento = @idest
      AND CAST(ef.FechaFicha AS date) BETWEEN @FECHA1 AND @FECHA2
      AND fp.fip_estado = 'L'
    GROUP BY ef.fic_descripcion
    ORDER BY especialidad;`;
  const rows = await execQuery<any>('db1', sql, { idest: Number(idest) });
  res.json(rows);
}

export async function listMedicos(req: Request, res: Response) {
  const { idest, especialidad } = req.query as any;
  const sql = `
    DECLARE @FECHA1 DATE = CONVERT(date, DATEADD(day, 1, GETDATE()));
    DECLARE @FECHA2 DATE = CONVERT(date, DATEADD(day, 2, GETDATE()));
    SELECT
      fp.idpersonal AS idpersonalmedico,
      MAX(ef.Medico) AS nombre_completo,
      COUNT(*) AS cupos
    FROM bdhistoriasclinicas..ErpFichas ef
    JOIN bdfichas..fic_fichas_programadas_pantalla fp
      ON fp.idfichaprogramada = ef.idfichaprogramada
    WHERE ef.idestablecimiento = @idest
      AND CAST(ef.FechaFicha AS date) BETWEEN @FECHA1 AND @FECHA2
      AND fp.fip_estado = 'L'
      AND ef.fic_descripcion = @especialidad
    GROUP BY fp.idpersonal
    ORDER BY nombre_completo;`;
  const rows = await execQuery<any>('db1', sql, {
    idest: Number(idest),
    especialidad: String(especialidad),
  });
  res.json(rows);
}

export async function listConsultorios(req: Request, res: Response) {
  const { idest } = req.query as any;
  const sql = `
    SELECT DISTINCT ef.idconsultorio,
      COALESCE(ef.Consultorio, 'SIN CONSULTORIO ASIGNADO') AS consultorio
    FROM bdhistoriasclinicas..ErpFichas ef
    JOIN bdfichas..fic_fichas_programadas_pantalla fp
      ON fp.idfichaprogramada = ef.idfichaprogramada
    WHERE ef.idestablecimiento = @idest
      AND CAST(ef.FechaFicha AS date)
          BETWEEN CONVERT(date, DATEADD(day, 1, GETDATE()))
              AND CONVERT(date, DATEADD(day, 2, GETDATE()))
      AND fp.fip_estado = 'L'
    ORDER BY consultorio;`;
  const rows = await execQuery<any>('db1', sql, { idest: Number(idest) });
  res.json(rows);
}

export async function listFechas(req: Request, res: Response) {
  const { idest, medicoId, especialidad } = req.query as any;
  const sql = `
    DECLARE @FECHA1 DATE = CONVERT(date, DATEADD(day, 1, GETDATE()));
    DECLARE @FECHA2 DATE = CONVERT(date, DATEADD(day, 2, GETDATE()));
    SELECT CAST(ef.FechaFicha AS date) AS fecha, COUNT(*) AS cupos
    FROM bdhistoriasclinicas..ErpFichas ef
    JOIN bdfichas..fic_fichas_programadas_pantalla fp
      ON fp.idfichaprogramada = ef.idfichaprogramada
    WHERE ef.idestablecimiento = @idest
      AND CAST(ef.FechaFicha AS date) BETWEEN @FECHA1 AND @FECHA2
      AND fp.fip_estado = 'L'
      AND (@medicoId IS NULL OR fp.idpersonal = @medicoId)
      AND (@especialidad IS NULL OR ef.fic_descripcion = @especialidad)
    GROUP BY CAST(ef.FechaFicha AS date)
    ORDER BY fecha;`;
  const rows = await execQuery<any>('db1', sql, {
    idest: Number(idest),
    medicoId: medicoId ? Number(medicoId) : null,
    especialidad: especialidad || null,
  });
  res.json(rows);
}

export async function listHoras(req: Request, res: Response) {
  const { idest, fecha, medicoId, consultorioId, especialidad } = req.query as any;
  const sql = `
    SELECT
      fp.idfichaprogramada,
      CONVERT(char(5), ef.InicioAtencion, 108) AS hora,
      ef.fic_descripcion AS especialidad,
      fp.idcuaderno,
      fp.idpersonal AS idpersonalmedico,
      COALESCE(ef.Consultorio, 'SIN CONSULTORIO ASIGNADO') AS consultorio,
      ef.idconsultorio
    FROM bdhistoriasclinicas..ErpFichas ef
    JOIN bdfichas..fic_fichas_programadas_pantalla fp
      ON fp.idfichaprogramada = ef.idfichaprogramada
    WHERE ef.idestablecimiento = @idest
      AND CAST(ef.FechaFicha AS date) = @fecha
      AND fp.fip_estado = 'L'
      AND (@medicoId IS NULL OR fp.idpersonal = @medicoId)
      AND (@especialidad IS NULL OR ef.fic_descripcion = @especialidad)
      AND (@consultorioId IS NULL OR ef.idconsultorio = @consultorioId)
    ORDER BY hora;`;
  const rows = await execQuery<any>('db1', sql, {
    idest: Number(idest),
    fecha: String(fecha),
    medicoId: medicoId ? Number(medicoId) : null,
    consultorioId: consultorioId ? Number(consultorioId) : null,
    especialidad: especialidad || null,
  });
  res.json(rows);
}

export async function crearCita(req: Request, res: Response) {
  const {
    idpoblacion, idestablecimiento, idfichaprogramada,
    idpersonalmedico, idcuaderno, idconsultorio,
    fecha, hora
  } = req.body;

  const { set } = getWindow();
  if (!set.has(fecha)) {
    return res.status(422).json({ ok:false, msg:'Solo se permite agendar D+1 o D+2' });
  }

  // 1) Una futura por persona
  const dup = await pg.oneOrNone(
    `SELECT 1 FROM citas_reservas
     WHERE idpoblacion=$1 AND estado IN ('RESERVADA','CONFIRMADA')
       AND fecha >= CURRENT_DATE`, [idpoblacion]);
  if (dup) return res.status(409).json({ ok:false, msg:'El paciente ya tiene una cita futura' });

  // 2) Tomar slot en MSSQL (optimista)
  const up = await execQuery<any>('db2', `
    UPDATE bdfichas..fic_fichas_programadas
       SET fip_estado = 'A', fic_descripcion = 'RESERVA APP'
     WHERE idfichaprogramada = @id AND fip_estado = 'L';
    SELECT @@ROWCOUNT AS rc;`, { id: Number(idfichaprogramada) });
  const rc = up?.[0]?.rc ?? 0;
  if (rc === 0) return res.status(409).json({ ok:false, msg:'Horario ya no está disponible' });

  // 3) Registrar en Postgres
  const reserva = await pg.one(`
    INSERT INTO citas_reservas
      (idpoblacion, idestablecimiento, idfichaprogramada, idpersonalmedico,
       idcuaderno, idconsultorio, fecha, hora, estado, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'RESERVADA',$9)
    RETURNING id, fecha, hora, estado`,
    [idpoblacion, idestablecimiento, idfichaprogramada, idpersonalmedico,
     idcuaderno, idconsultorio, fecha, hora, (req as any).user?.matricula ?? 'app']);
  res.status(201).json({ ok:true, reserva });
}
