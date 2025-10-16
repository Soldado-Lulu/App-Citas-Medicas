// Servicio de autenticación: el frontend NO sabe si es mock o real.
// El mock acepta cualquier contraseña; decide rol por matrícula.

import { http } from "./apiClient";

export const login = (matricula: string) =>
  http(`/auth/login`, { method: "POST", body: JSON.stringify({ matricula }) });

