import { http } from "./apiClient";

export async function getDisponibilidad(fechaISO: string) {
  return http<Array<{ medico: { id: number; nombre: string; especialidad: string }, slots: Array<{ start: string; end: string; libre: boolean }> }>>(
    `/citas/disponibilidad?fecha=${fechaISO}`
  );
}

export async function crearCita(payload: { user_id: number; medico_id: number; start: string; end: string }) {
  return http<any>("/citas", { method: "POST", body: JSON.stringify(payload) });
}

export async function getMisCitas(userId: number) {
  return http<any[]>(`/citas?user_id=${userId}`);
}
