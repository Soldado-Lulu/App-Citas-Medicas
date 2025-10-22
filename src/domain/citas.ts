// Row de la vista: bdfichas.dbo.fic_fichas_programadas_pantalla
export interface FichaProgramadaRow {
  idfichaprogramada: number;
  idpersonal: number;
  paciente: string;            // "LIBRE" cuando está disponible
  fip_fecha_ini: string;       // 'YYYY-MM-DDTHH:mm:ss' (datetime)
  fip_hora_fin: string;        // 'YYYY-MM-DDTHH:mm:ss' (datetime)
  fip_estado: string;          // 'Disponible' | 'Asignado' | ...
  idetiqueta: number;
  idcobertura: number;
  Cobertura: string;           // texto, p.ej. "LIBRE" o cobertura
  fichasinpaciente: 0 | 1;     // 1 = libre
  fecha: string;               // 'YYYY-MM-DD'
  idcuaderno: number;
  idestablecimiento: number;
}

export interface Especialidad {
  idespecialidad: number;
  nombre: string;
}

export interface Doctor {
  idpersonalmedico: number;
  nombre_completo: string;
}

export interface CitaCreada {
  idcita: number;
}

export interface FiltroDisponibilidad {
  idespecialidad?: number;
  idpersonal?: number;
  fecha: string;               // 'YYYY-MM-DD'
  idestablecimiento?: number;
}
