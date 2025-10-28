import { get, post } from './http';
import { FichaProgramadaRow, FiltroDisponibilidad, Especialidad, Doctor, CitaCreada } from '../domain/citas';

// Catálogo
export async function getEspecialidades() {
  const r = await get<{ ok: boolean; especialidades: Especialidad[] }>(`/api/fichas/especialidades`);
  return r.especialidades;
}

export async function getDoctores(idespecialidad: number) {
  const r = await get<{ ok: boolean; doctores: Doctor[] }>(`/api/fichas/doctores?idespecialidad=${idespecialidad}`);
  return r.doctores;
}

// Disponibilidad desde la vista de fichas (solo LIBRES)
export async function getDisponibilidadVista(filter: FiltroDisponibilidad) {
  const params = new URLSearchParams();
  params.set('fecha', filter.fecha);
  if (filter.idespecialidad) params.set('idespecialidad', String(filter.idespecialidad));
  if (filter.idpersonal)     params.set('idpersonal', String(filter.idpersonal));
  if (filter.idestablecimiento) params.set('idestablecimiento', String(filter.idestablecimiento));

  const r = await get<{ ok: boolean; filas: FichaProgramadaRow[] }>(`/api/fichas/disponibilidad?${params.toString()}`);
  return r.filas;
}

// Confirmar una ficha programada: asignar paciente sobre idfichaprogramada
export async function confirmarFichaProgramada(input: {
  idfichaprogramada: number;
  idpoblacion: number;       // paciente titular o afiliado
}) {
  const r = await post<{ ok: boolean; cita: CitaCreada }>(`/api/fichas/citas/programada`, input);
  return r.cita;
}

// Mis citas (pendientes/futuras) del grupo familiar
export async function getMisCitasGrupo(idpoblacionTitular: number) {
  const r = await get<{ ok: boolean; citas: Array<{
    idcita: number;
    idpoblacion: number;
    paciente: string;
    doctor: string;
    especialidad: string | null;
    fecha: string; // 'YYYY-MM-DD'
    hora: string;  // 'HH:mm'
    estado: string;
  }> }>(`/api/fichas/citas/grupo/${idpoblacionTitular}`);
  return r.citas;
}
