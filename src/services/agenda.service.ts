// src/services/agenda.service.ts
import { get, post } from './http';

// Tipos base
export type Especialidad = {
  idcuaderno: number;
  nombre: string;
};

export type Doctor = {
  idpersonalmedico: number;
  nombre_completo: string;
};

// 👇 respuestas tipadas por endpoint (ajusta keys si tu backend usa otras)
type EspecialidadesResp = { especialidades: Especialidad[] };
type DoctoresResp       = { doctores: Doctor[] };
type SlotsResp          = { slots: Array<{ hora: string; disponible: boolean }> };
type CrearCitaResp      = { ok: boolean; idcita?: number };

// 1) Especialidades por establecimiento
export async function getEspecialidades(idest: number) {
  const res = await get<EspecialidadesResp>(`/api/fichas/especialidades?idest=${idest}`);
  return res.especialidades ?? [];
}

// 2) Doctores por especialidad (idcuaderno) y establecimiento
export async function getDoctores(idcuaderno: number, idest: number) {
  const res = await get<DoctoresResp>(`/api/fichas/doctores?idcuaderno=${idcuaderno}&idest=${idest}`);
  return res.doctores ?? [];
}

// 3) Slots/horarios disponibles de un doctor en una fecha
export async function getSlots(idpersonal: number, fecha: string, idest: number) {
  const res = await get<SlotsResp>(`/api/fichas/doctores/${idpersonal}/slots?fecha=${encodeURIComponent(fecha)}&idest=${idest}`);
  return res.slots ?? [];
}

// 4) Crear cita programada
export async function crearCita(input: {
  idpoblacion: number;
  idpersonal: number;
  fecha: string;
  hora: string;
  idcuaderno?: number;
}) {
  const res = await post<CrearCitaResp>(`/api/fichas/citas/programada`, input);
  return res;
}
