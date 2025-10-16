import { http } from "./apiClient";

export type CitaUsuario = {
  id: number;
  person_id: number;
  booked_by: number;
  medico_id: number;
  start: string;
  end: string;
  estado: "reservada" | "cancelada" | "atendida";
  // campos enriquecidos por el mock:
  persona_nombre?: string;
  titular_nombre?: string;
  medico_nombre?: string;
  medico_especialidad?: string;
};

export const getDisponibilidad = (fecha: string) =>
  http(`/disponibilidad?fecha=${fecha}`);

export const crearCita = (payload: any) =>
  http(`/citas`, { method: "POST", body: JSON.stringify(payload) });

export const getMisCitas = (titularId: number) =>
  http(`/citas?titular_id=${titularId}`);
