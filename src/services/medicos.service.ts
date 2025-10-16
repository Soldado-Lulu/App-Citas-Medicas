import { http } from "./apiClient";
export async function getMedicos() {
  return http<Array<{ id: number; nombre: string; especialidad: string }>>("/medicos");
}
