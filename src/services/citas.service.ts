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

export async function getDisponibilidad(fechaISO: string) {
  return http<
    Array<{
      medico: { id: number; nombre: string; especialidad: string };
      slots: Array<{ start: string; end: string; libre: boolean }>;
    }>
  >(`/citas/disponibilidad?fecha=${fechaISO}`);
}

export async function crearCita(payload: {
  person_id: number;
  booked_by: number;
  medico_id: number;
  start: string;
  end: string;
}) {
  return http<CitaUsuario>("/citas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMisCitas(titularId: number) {
  return http<CitaUsuario[]>(`/citas?user_id=${titularId}`);
}
