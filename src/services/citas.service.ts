import { http } from "./apiClient";

export async function getDisponibilidad(fechaISO: string) {
  return http<
    Array<{
      usuario: { id: number; name: string };
      medico: { id: number; nombre: string; especialidad: string };
      slots: Array<{ start: string; end: string; libre: boolean }>;
    }>
  >(`/citas/disponibilidad?fecha=${fechaISO}`);
}

export async function crearCita(payload: {
  person_id: number;     // 👈 ahora es la persona (titular o afiliado)
  booked_by: number;     // 👈 titular que reserva (para auditoría)
  medico_id: number;
  start: string;
  end: string;
}) {
  return http<any>("/citas", { method: "POST", body: JSON.stringify(payload) });
}

export async function getMisCitas(titularId: number) {
  // devuelve las citas del titular y sus personas (titular + afiliados)
  return http<any[]>(`/citas?user_id=${titularId}`);
}
