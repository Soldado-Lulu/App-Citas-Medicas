// ─────────────────────────────────────────────
// 📁 src/services/agenda.service.ts
// Servicios de agenda médica (ajustados a tu BD real):
//   • Especialidades  →  desde hcl_especialidad_medico (idcuaderno, especialidad)
//   • Doctores        →  desde fichas_programadas_pantalla
//   • Horarios libres →  desde fichas_programadas_pantalla
//   • Crear cita      →  inserta una nueva cita
// ─────────────────────────────────────────────

import { apiGet, apiPost } from './http';

// Tipos base
export type Especialidad = {
  idcuaderno: number;
  nombre: string;
};

export type Doctor = {
  idpersonalmedico: number;
  nombre_completo: string;
};

// ─────────────────────────────────────────────
// 📘 1) Especialidades (idcuaderno, nombre)
// ─────────────────────────────────────────────
export async function getEspecialidades(idest: number) {
  const res = await apiGet(`/api/fichas/especialidades?idest=${idest}`);
  return res?.especialidades ?? [];
}

// ─────────────────────────────────────────────
// 📘 2) Doctores según especialidad (idcuaderno)
// ─────────────────────────────────────────────
export async function getDoctores(idcuaderno: number, idest: number) {
  const res = await apiGet(`/api/fichas/doctores?idcuaderno=${idcuaderno}&idest=${idest}`);
  return res?.doctores ?? [];
}

// ─────────────────────────────────────────────
// 📘 3) Horarios disponibles del doctor
// ─────────────────────────────────────────────
export async function getSlots(idpersonal: number, fecha: string, idest: number) {
  const res = await apiGet(`/api/fichas/doctores/${idpersonal}/slots?fecha=${encodeURIComponent(fecha)}&idest=${idest}`);
  return res?.slots ?? [];
}

// ─────────────────────────────────────────────
// 📘 4) Crear cita médica
// (puedes ampliar con idcuaderno si tu backend lo espera)
// ─────────────────────────────────────────────
export async function crearCita(input: {
  idpoblacion: number;
  idpersonal: number;
  fecha: string;
  hora: string;
  idcuaderno?: number;
}) {
  const r = await apiPost<{ ok: boolean; idcita?: number }>(
    `/api/fichas/citas/programada`,
    input
  );
  return r;
}
