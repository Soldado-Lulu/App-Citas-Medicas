import { http } from "./apiClient";

export type Persona = { id: number; name: string; isTitular: boolean; relation: string };

// personas.service.ts
export const getPersonas = (matricula: string) =>
  http(`/personas?matricula=${encodeURIComponent(matricula)}`);

// catalogos
export const getEspecialidades = () => http(`/especialidades`);
export const getMedicos = (especialidad_id?: number) =>
  http(`/medicos${especialidad_id ? `?especialidad_id=${especialidad_id}` : ""}`);

// citas
export const getDisponibilidad = (fecha: string) =>
  http(`/disponibilidad?fecha=${fecha}`);
export const crearCita = (payload: any) =>
  http(`/citas`, { method: "POST", body: JSON.stringify(payload) });
export const getMisCitas = (titular_id: number) =>
  http(`/citas?titular_id=${titular_id}`);
