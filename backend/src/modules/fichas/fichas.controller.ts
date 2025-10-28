import { Request, Response,NextFunction } from 'express';
import sql from 'mssql';
import { execQuery } from '@/config/db';

// ================== PERSONAS ==================
export async function getTitularByMatricula(req: Request, res: Response) {
  try {
    const { matricula } = req.query as { matricula?: string };
    if (!matricula) return res.status(400).json({ ok:false, msg:'Falta matrícula' });

    // Busca por número de historia o código (como en login)
    const rows = await execQuery<any>('db2', `
      SELECT TOP 1
        p.idpoblacion,
        LTRIM(RTRIM(p.pac_numero_historia)) AS matricula,
        LTRIM(RTRIM(p.pac_nombre)) AS pac_nombre,
        LTRIM(RTRIM(p.pac_primer_apellido)) AS pac_primer_apellido,
        LTRIM(RTRIM(p.pac_segundo_apellido)) AS pac_segundo_apellido,
        p.pac_documento_id AS documento
      FROM dbo.hcl_poblacion_datos_completos p
      WHERE LTRIM(RTRIM(p.pac_numero_historia)) = @m
         OR LTRIM(RTRIM(p.pac_codigo))        = @m
    `, (r: sql.Request) => r.input('m', sql.VarChar, matricula.trim()));

    if (!rows.length) return res.status(404).json({ ok:false, msg:'No encontrado' });

    const r = rows[0];
    const persona = {
      idpoblacion: r.idpoblacion,
      matricula: r.matricula,
      pac_nombre: r.pac_nombre,
      pac_primer_apellido: r.pac_primer_apellido,
      pac_segundo_apellido: r.pac_segundo_apellido,
      documento: r.documento,
      nombre_completo: [r.pac_nombre, r.pac_primer_apellido, r.pac_segundo_apellido].filter(Boolean).join(' ')
    };
    res.json({ ok:true, persona });
  } catch (e:any) { res.status(500).json({ ok:false, msg:e.message }); }
}

export async function getAfiliadosByTitular(req: Request, res: Response) {
  try {
    const { idpoblacion } = req.params;

    // Toma la misma historia del titular y trae a los demás (excluye titular)
    const rows = await execQuery<any>('db2', `
      SELECT
        b.idpoblacion,
        LTRIM(RTRIM(b.pac_numero_historia)) AS matricula,
        LTRIM(RTRIM(b.pac_nombre)) AS pac_nombre,
        LTRIM(RTRIM(b.pac_primer_apellido)) AS pac_primer_apellido,
        LTRIM(RTRIM(b.pac_segundo_apellido)) AS pac_segundo_apellido,
        b.pac_documento_id AS documento
      FROM dbo.hcl_poblacion_datos_completos b
      WHERE LTRIM(RTRIM(b.pac_numero_historia)) = (
        SELECT TOP 1 LTRIM(RTRIM(pac_numero_historia))
        FROM dbo.hcl_poblacion_datos_completos
        WHERE idpoblacion = @id
      )
        AND b.idpoblacion <> @id
      ORDER BY b.pac_primer_apellido, b.pac_segundo_apellido, b.pac_nombre
    `, (r: sql.Request) => r.input('id', sql.Int, Number(idpoblacion)));

    const afiliados = rows.map((x:any)=>({
      idpoblacion: x.idpoblacion,
      matricula: x.matricula,
      documento: x.documento,
      pac_nombre: x.pac_nombre,
      pac_primer_apellido: x.pac_primer_apellido,
      pac_segundo_apellido: x.pac_segundo_apellido,
      nombre_completo: [x.pac_nombre, x.pac_primer_apellido, x.pac_segundo_apellido].filter(Boolean).join(' ')
    }));
    res.json({ ok:true, afiliados });
  } catch (e:any) { res.status(500).json({ ok:false, msg:e.message }); }
}

// ================== ESPECIALIDADES (auto-detección) ==================
// Busca alguna tabla conocida de especialidades y detecta columnas id/nombre.
// Soporta: hcl_especialidad, se_consulta_externa, hcl_seccion_trabajo (u otras con columnas afines).
// GET /api/fichas/especialidades
// GET /api/fichas/especialidades?idest=120
export async function getEspecialidades(req: Request, res: Response) {
  try {
    const { idest } = req.query as { idest?: string };
    if (!idest) return res.status(400).json({ ok:false, msg:'Falta idest' });

    const rows = await execQuery<any>('db2', `
      SELECT DISTINCT
        f.idcuaderno,
        LTRIM(RTRIM(hm.especialidad)) AS especialidad
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla f
      JOIN bdhistoriasclinicas.dbo.hcl_especialidad_medico hm
           ON hm.idcuaderno = f.idcuaderno
      LEFT JOIN bdhistoriasclinicas.dbo.hcl_personal_salud ps
           ON ps.idpersonalmedico = f.idpersonal
      WHERE COALESCE(f.idestablecimiento, ps.idestablecimiento) = @idest
      ORDER BY especialidad
    `, r => r.input('idest', sql.Int, Number(idest)));

    const especialidades = rows.map((r:any) => ({
      idcuaderno: Number(r.idcuaderno),
      nombre: String(r.especialidad),
    }));

    res.json({ ok:true, especialidades });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}




// ================== DOCTORES POR ESPECIALIDAD ==================
// GET /api/fichas/doctores? idcuaderno=123
// GET /api/fichas/doctores?idcuaderno=3023&idest=120
export async function getDoctoresPorEspecialidad(req: Request, res: Response) {
  try {
    const { idcuaderno, idest } = req.query as { idcuaderno?: string; idest?: string };
    if (!idcuaderno || !idest) return res.status(400).json({ ok:false, msg:'Faltan idcuaderno o idest' });

    const rows = await execQuery<any>('db2', `
      SELECT
        f.idpersonal,
        LTRIM(RTRIM(ps.per_nombre))          AS nombre,
        LTRIM(RTRIM(ps.per_primer_apellido)) AS ap1,
        LTRIM(RTRIM(ps.per_segundo_apellido)) AS ap2
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla f
      JOIN bdhistoriasclinicas.dbo.hcl_personal_salud ps
           ON ps.idpersonalmedico = f.idpersonal
      WHERE f.idcuaderno = @idc
        AND COALESCE(f.idestablecimiento, ps.idestablecimiento) = @idest
      GROUP BY f.idpersonal, ps.per_nombre, ps.per_primer_apellido, ps.per_segundo_apellido
      ORDER BY ap1, ap2, nombre
    `, r => {
      r.input('idc', sql.Int, Number(idcuaderno));
      r.input('idest', sql.Int, Number(idest));
    });

    const doctores = rows.map((d:any)=>({
      idpersonalmedico: d.idpersonal,
      nombre_completo: [d.nombre, d.ap1, d.ap2].filter(Boolean).join(' ')
    }));

    res.json({ ok:true, doctores });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}

// ================== SLOTS (HORAS LIBRES) ==================
// Lee horas ocupadas desde hcl_citas y genera espacios libres
// GET /api/fichas/doctores/:idpersonal/slots?fecha=YYYY-MM-DD
// GET /api/fichas/doctores/:idpersonal/slots?fecha=YYYY-MM-DD&idest=120
export async function getSlotsDoctor(req: Request, res: Response) {
  try {
    const idpersonal = Number(req.params.idpersonal);
    const { fecha, idest } = req.query as { fecha?: string; idest?: string };
    if (!fecha || !idest) return res.status(400).json({ ok:false, msg:'Faltan fecha o idest' });

    const rows = await execQuery<any>('db2', `
      SELECT
        idfichaprogramada,
        CONVERT(char(5), CAST(fip_fecha_ini AS time), 108) AS hora
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla
      WHERE idpersonal = @idp
        AND CONVERT(date, fip_fecha_ini) = @f
        AND fip_estado = 'Disponible'
        AND fichasinpaciente = 1
        AND COALESCE(idestablecimiento, (SELECT TOP 1 idestablecimiento
                                         FROM bdhistoriasclinicas.dbo.hcl_personal_salud
                                         WHERE idpersonalmedico = @idp)) = @idest
      ORDER BY fip_fecha_ini
    `, r => {
      r.input('idp', sql.Int, idpersonal);
      r.input('f', sql.Date, fecha);
      r.input('idest', sql.Int, Number(idest));
    });

    res.json({ ok:true, slots: rows.map((x:any)=>x.hora), fichas: rows });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}

// ================== CREAR CITA ==================
// POST /api/fichas/citas/programada  { idfichaprogramada, idpoblacion }
export async function crearCitaDesdeFicha(req: Request, res: Response) {
  try {
    const { idfichaprogramada, idpoblacion } = req.body as { idfichaprogramada:number; idpoblacion:number; };
    if (!idfichaprogramada || !idpoblacion) return res.status(400).json({ ok:false, msg:'Faltan datos' });

    // Lee la ficha (solo si está libre)
    const ficha = (await execQuery<any>('db2', `
      SELECT TOP 1 idpersonal, fip_fecha_ini
      FROM bdfichas.dbo.fic_fichas_programadas_pantalla
      WHERE idfichaprogramada = @idf AND fip_estado='Disponible' AND fichasinpaciente=1
    `, r => r.input('idf', sql.Int, idfichaprogramada)))[0];

    if (!ficha) return res.status(409).json({ ok:false, msg:'La ficha ya no está disponible' });

    // Crea la cita (ajusta a tu modelo real)
    const rows = await execQuery<any>('db2', `
      INSERT INTO bdhistoriasclinicas.dbo.hcl_citas (idpoblacion, idpersonal, cit_fecha_ini, cit_estado)
      VALUES (@idpoblacion, @idpersonal, @fechaIni, 'P');
      SELECT SCOPE_IDENTITY() AS idcita;
    `, r => {
      r.input('idpoblacion', sql.Int, idpoblacion);
      r.input('idpersonal', sql.Int, ficha.idpersonal);
      r.input('fechaIni',  sql.DateTime, new Date(ficha.fip_fecha_ini));
    });

    res.status(201).json({ ok:true, cita: { idcita: rows[0]?.idcita ?? null } });
  } catch (e:any) {
    res.status(500).json({ ok:false, msg:e.message });
  }
}

// src/modules/fichas/fichas.controller.ts
import { findGrupoInfoByMatricula } from './fichas.repository';

export async function getGrupoInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { matricula } = req.params;
    if (!matricula) return res.status(400).json({ message: 'Falta matrícula' });
    const rows = await findGrupoInfoByMatricula(String(matricula));
    res.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    next(err);
  }
}
