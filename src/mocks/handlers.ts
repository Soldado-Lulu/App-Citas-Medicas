// Implementa "endpoints" mock que imitan al backend real.
// Así las pantallas funcionan hoy y mañana cambias a API real sólo con EXPO_PUBLIC_API_URL.

import { DB } from "./db";
import dayjs from "dayjs";

export async function mockHttp<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const u = new URL(path, "http://mock.local"); // truco para usar URLSearchParams

  // --- AUTH ---
  if (u.pathname === "/auth/login" && method === "POST") {
    const body = JSON.parse(String(init?.body || "{}"));
    const user = DB.users.find(x => x.matricula === body.matricula);
    if (!user) throw new Error("Credenciales inválidas");
    return { token: "mock-token", user } as unknown as T;
  }

  // --- CONFIG ---
  if (u.pathname === "/config/agenda" && method === "GET") {
    return DB.config as unknown as T;
  }

  // --- DISPONIBILIDAD ---
  if (u.pathname === "/citas/disponibilidad" && method === "GET") {
    const fecha = u.searchParams.get("fecha");
    if (!fecha) throw new Error("Fecha requerida");
    const startDay = dayjs(fecha).startOf("day");

    const out = DB.medicos.map((m) => {
      const slots: Array<{ start: string; end: string; libre: boolean }> = [];
      // slots cada N minutos de 08:00 a 12:00
      let t = startDay.hour(8).minute(0);
      const end = startDay.hour(12).minute(0);
      while (t.isBefore(end)) {
        const s = t.toISOString();
        const e = t.add(DB.config.slot_min, "minute").toISOString();
        const ocupado = DB.citas.some(c => c.medico_id === m.id && c.start === s);
        slots.push({ start: s, end: e, libre: !ocupado });
        t = t.add(DB.config.slot_min, "minute");
      }
      return { medico: m, slots };
    });

    return out as unknown as T;
  }

  // --- CREAR CITA ---
  if (u.pathname === "/citas" && method === "POST") {
    const body = JSON.parse(String(init?.body || "{}"));
    const id = DB.citas.length + 1;
    DB.citas.push({
      id,
      user_id: body.user_id,
      medico_id: body.medico_id,
      start: body.start,
      end: body.end,
      estado: "reservada",
    });
    return DB.citas[DB.citas.length - 1] as unknown as T;
  }

  // --- MIS CITAS ---
  if (u.pathname === "/citas" && method === "GET") {
    const userId = Number(u.searchParams.get("user_id"));
    const arr = DB.citas.filter(c => c.user_id === userId);
    return arr as unknown as T;
  }

  // --- MÉDICOS (extra opcional) ---
  if (u.pathname === "/medicos" && method === "GET") {
    return DB.medicos as unknown as T;
  }

  throw new Error(`Mock no implementado: ${method} ${u.pathname}${u.search}`);
}
