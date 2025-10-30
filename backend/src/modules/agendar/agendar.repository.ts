import sql from 'mssql';
import { execQuery } from '@/config/db';

// Doctores con fichas libres (MG/MF) en un establecimiento y fecha
export async function listDoctoresDisponibles(fecha: string, idest: number) {
  const rows = await execQuery<any>('db2', `
    DECLARE @fecha date = @p_fecha;
    DECLARE @idest int = @p_idest;

    SELECT DISTINCT
      f.idpersonal                               AS idpersonalmedico,
      LTRIM(RTRIM(ps.per_nombre)) + ' '
        + LTRIM(RTRIM(ps.per_campo1)) + ' '
        + LTRIM(RTRIM(ps.per_campo2))            AS nombre_completo,
      f.idcuaderno,
      esp.esp_descripcion                        AS especialidad
    FROM bdfichas.dbo.fic_fichas_programadas_pantalla f WITH (NOLOCK)
    JOIN bdhistoriasclinicas.dbo.hcl_cuaderno c       WITH (NOLOCK) ON c.idCuaderno      = f.idcuaderno
    JOIN bdhistoriasclinicas.dbo.hcl_especialidad esp WITH (NOLOCK) ON esp.idespecialidad = c.idespecialidad
    JOIN bdhistoriasclinicas.dbo.hcl_personal_salud ps WITH (NOLOCK) ON ps.idpersonalmedico = f.idpersonal
    WHERE CONVERT(date, f.fip_fecha_ini) = @fecha
      AND f.fip_estado = 'Disponible'
      AND f.fichasinpaciente = 1
      AND f.idestablecimiento = @idest
      AND UPPER(esp.esp_descripcion) COLLATE Latin1_General_CI_AI IN ('MEDICINA GENERAL','MEDICINA FAMILIAR')
    ORDER BY especialidad, nombre_completo;
  `, r => {
    r.input('p_fecha', sql.Date, fecha);
    r.input('p_idest', sql.Int, idest);
  });

  return rows;
}

// Slots para un doctor (MG/MF), con consultorio si existe asignación en la puente
export async function listSlotsMgMf(idpersonal: number, fecha: string, idest: number, idconsultorio: number | null) {
  const rows = await execQuery<any>('db2', `
    DECLARE @fecha date = @p_fecha;
    DECLARE @idest int = @p_idest;
    DECLARE @idpersonal int = @p_idpersonal;
    DECLARE @idconsultorio int = @p_idconsultorio;

    SELECT
      f.idfichaprogramada,
      CONVERT(char(5), CAST(f.fip_fecha_ini AS time), 108) AS hora,
      esp.esp_descripcion                                  AS especialidad,
      f.idcuaderno,
      f.idpersonal                                         AS idpersonalmedico,
      LTRIM(RTRIM(ps.per_nombre)) + ' '
        + LTRIM(RTRIM(ps.per_campo1)) + ' '
        + LTRIM(RTRIM(ps.per_campo2))                      AS medico,
      CA.idconsultorio,
      CASE WHEN CA.idconsultorio IS NULL
           THEN 'SIN CONSULTORIO ASIGNADO'
           ELSE 'CONSULTORIO ' + CAST(CA.idconsultorio AS varchar(10))
      END AS consultorio
    FROM bdfichas.dbo.fic_fichas_programadas_pantalla f WITH (NOLOCK)
    JOIN bdhistoriasclinicas.dbo.hcl_cuaderno c               WITH (NOLOCK) ON c.idCuaderno      = f.idcuaderno
    JOIN bdhistoriasclinicas.dbo.hcl_especialidad esp         WITH (NOLOCK) ON esp.idespecialidad = c.idespecialidad
    JOIN bdhistoriasclinicas.dbo.hcl_personal_salud ps        WITH (NOLOCK) ON ps.idpersonalmedico = f.idpersonal
    OUTER APPLY (
      SELECT TOP (1) cpc.idconsultorio
      FROM bdhistoriasclinicas.dbo.hcl_consultorio_personal_cuaderno cpc WITH (NOLOCK)
      WHERE cpc.idcuaderno = f.idcuaderno
        AND cpc.idpersonal = f.idpersonal
        AND cpc.idestablecimiento = f.idestablecimiento
        AND ( @idconsultorio IS NULL OR cpc.idconsultorio = @idconsultorio )
      ORDER BY cpc.idconsultorio
    ) CA
    WHERE f.idestablecimiento = @idest
      AND CONVERT(date, f.fip_fecha_ini) = @fecha
      AND f.idpersonal = @idpersonal
      AND f.fip_estado = 'Disponible'
      AND f.fichasinpaciente = 1
      AND UPPER(esp.esp_descripcion) COLLATE Latin1_General_CI_AI IN ('MEDICINA GENERAL','MEDICINA FAMILIAR')
    ORDER BY esp.esp_descripcion, hora, medico;
  `, r => {
    r.input('p_fecha', sql.Date, fecha);
    r.input('p_idest', sql.Int, idest);
    r.input('p_idpersonal', sql.Int, idpersonal);
    r.input('p_idconsultorio', sql.Int, idconsultorio ?? null);
  });

  return rows;
}

// Valida ficha (MG/MF, disponible, mismo establecimiento) y crea la cita
export async function validarFichaMgMfYCrearCita(idfichaprogramada: number, idpoblacion: number, idest: number) {
  // 1) Validación
  const check = await execQuery<any>('db2', `
    DECLARE @idf int = @p_idf;
    DECLARE @idest int = @p_idest;

    SELECT TOP 1 f.idpersonal, f.fip_fecha_ini
    FROM bdfichas.dbo.fic_fichas_programadas_pantalla f WITH (NOLOCK)
    JOIN bdhistoriasclinicas.dbo.hcl_cuaderno c       WITH (NOLOCK) ON c.idCuaderno      = f.idcuaderno
    JOIN bdhistoriasclinicas.dbo.hcl_especialidad esp WITH (NOLOCK) ON esp.idespecialidad = c.idespecialidad
    WHERE f.idfichaprogramada = @idf
      AND f.idestablecimiento = @idest
      AND f.fip_estado = 'Disponible'
      AND f.fichasinpaciente = 1
      AND UPPER(esp.esp_descripcion) COLLATE Latin1_General_CI_AI IN ('MEDICINA GENERAL','MEDICINA FAMILIAR');
  `, r => {
    r.input('p_idf', sql.Int, idfichaprogramada);
    r.input('p_idest', sql.Int, idest);
  });

  const ficha = check?.[0];
  if (!ficha) {
    return { ok:false, status:409, msg:'La ficha no es válida (no es MG/MF, no está disponible o no pertenece al establecimiento).' };
  }

  // 2) Crear cita
  const rows = await execQuery<any>('db2', `
    INSERT INTO bdhistoriasclinicas.dbo.hcl_citas (idpoblacion, idpersonal, cit_fecha_ini, cit_estado)
    VALUES (@idpoblacion, @idpersonal, @fechaIni, 'P');
    SELECT SCOPE_IDENTITY() AS idcita;
  `, r => {
    r.input('idpoblacion', sql.Int, idpoblacion);
    r.input('idpersonal', sql.Int, ficha.idpersonal);
    r.input('fechaIni',  sql.DateTime, new Date(ficha.fip_fecha_ini));
  });

  return { ok:true, msg:'Cita creada', cita: { idcita: rows?.[0]?.idcita ?? null } };
}
