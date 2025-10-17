// src/shared/index.ts

// Ejemplo: formatear fechas
export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Ejemplo: respuesta estándar
export function ok<T>(data: T) {
  return { ok: true, data };
}

// Ejemplo: manejo simple de errores
export function fail(message: string, detail?: any) {
  return { ok: false, message, detail };
}
