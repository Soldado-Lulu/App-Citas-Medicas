import { http } from "./apiClient";

export type Persona = { id: number; name: string; isTitular: boolean; relation: string };

export async function getPersonas(titularId: number) {
  return http<Persona[]>(`/personas?user_id=${titularId}`);
}
