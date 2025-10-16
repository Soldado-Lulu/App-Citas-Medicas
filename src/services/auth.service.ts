// Servicio de autenticación: el frontend NO sabe si es mock o real.
// El mock acepta cualquier contraseña; decide rol por matrícula.

import { http } from "./apiClient";

export async function login(matricula: string, password: string) {
  return http<{
    token: string;
    user: { id: number; name: string; role: "user" | "admin"; matricula: string };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ matricula, password }),
  });
}
