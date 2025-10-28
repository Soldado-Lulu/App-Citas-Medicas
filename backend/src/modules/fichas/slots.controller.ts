import sql from 'mssql';
import { Request, Response } from 'express';
import { execQuery } from '@/config/db';
import { inferirContextoMedico } from './context.repository';

/** GET /api/fichas/mis-slots?fecha=YYYY-MM-DD (token requerido) */
export async function getMisSlots(req: Request, res: Response) {
  const user = req.user;
  const { fecha } = req.query as { fecha?: string };
  if (!user?.idpersonal) return res.status(400).json({ ok:false, msg:'Falta idpersonal en token' });
  if (!fecha) return res.status(400).json({ ok:false, msg:'Falta fecha' });

  // 1) usar consultorio del token si viene; si no, inferir
  let idc = user.idc ?? null;
  let idest = user.est ?? null;

  if (idc == null || idest == null) {
    const ctx = await inferirContextoMedico(user.idpersonal);
    if (!ctx) return res.status(404).json({ ok:false, msg:'Sin contexto inferido' });
    idc = ctx.idcuaderno;
    idest = ctx.idestablecimiento;
  }

  // 2) slots libres del consultorio y establecimiento del usuario
  const rows = await execQuery<any>('db2', `
    SELECT
      idfichaprogramada,
      CONVERT(char(5), CAST(fip_fecha_ini AS time), 108) AS hora
    FROM bdfichas.dbo.fic_fichas_programadas_pantalla
    WHERE idpersonal = @idp
      AND idcuaderno = @idc
      AND idestablecimiento = @idest
      AND CONVERT(date, fip_fecha_ini) = @f
      AND fip_estado IN ('L','Disponible')
      AND fichasinpaciente = 1
    ORDER BY fip_fecha_ini;
  `, (r: sql.Request) => {
    r.input('idp', sql.Int, user.idpersonal!);
    r.input('idc', sql.Int, idc!);
    r.input('idest', sql.Int, idest!);
    r.input('f', sql.Date, fecha);
  });

  res.json({ ok:true, contexto: { idc, idest }, slots: rows.map((x:any)=>x.hora), fichas: rows });
}
