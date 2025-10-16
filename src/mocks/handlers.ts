// src/mocks/handlers.ts
import dayjs from "../lib/dayjs";
import { DB, Window } from "./db";

function atTime(base: dayjs.Dayjs, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return base.hour(h).minute(m).second(0).millisecond(0);
}
function buildSlotsInWindow(base: dayjs.Dayjs, win: Window, minutes: number) {
  const slots: Array<{ start: string; end: string }> = [];
  let t = atTime(base, win.start);
  const end = atTime(base, win.end);
  while (t.add(minutes, "minute").isSameOrBefore(end)) {
    const s = t.toISOString();
    const e = t.add(minutes, "minute").toISOString();
    slots.push({ start: s, end: e });
    t = t.add(minutes, "minute");
  }
  return slots;
}
function getWindowsForMedicoOnDate(medicoId: number, dateISO: string): Window[] {
  const m = DB.medicos.find(x => x.id === medicoId);
  if (!m) return [];
  const dow = dayjs(dateISO).day() as 0|1|2|3|4|5|6;
  return m.horarios[dow] || [];
}

// 🔹 Helper: todas las personas (titular + afiliados) para un titular
function personasDeTitular(titularId: number) {
  const titular = DB.users.find(u => u.id === titularId);
  if (!titular || titular.role !== "user") return [];
  const af = DB.afiliados.filter(a => a.titular_id === titularId);
  return [
    { id: titular.id, name: titular.name, isTitular: true, relation: "Titular" },
    ...af.map(a => ({ id: a.id, name: a.name, isTitular: false, relation: a.relation }))
  ];
}

export async function mockHttp<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const u = new URL(path, "http://mock.local");

  // AUTH
  if (u.pathname === "/auth/login" && method === "POST") {
    const body = JSON.parse(String(init?.body || "{}"));
    const user = DB.users.find(x => x.matricula === body.matricula);
    if (!user) throw new Error("Credenciales inválidas");
    return { token: "mock-token", user } as unknown as T;
  }

  // CONFIG
  if (u.pathname === "/config/agenda" && method === "GET") {
    return DB.config as unknown as T;
  }

  // 🔹 NUEVO: PERSONAS (titular + afiliados)
  if (u.pathname === "/personas" && method === "GET") {
    const titularId = Number(u.searchParams.get("user_id"));
    return personasDeTitular(titularId) as unknown as T;
  }

  // DISPONIBILIDAD
  if (u.pathname === "/citas/disponibilidad" && method === "GET") {
    const fecha = u.searchParams.get("fecha");
    if (!fecha) throw new Error("Fecha requerida");

    const base = dayjs(fecha).startOf("day");
    const isHoliday = DB.config.feriados.includes(base.format("YYYY-MM-DD"));
    const dow = base.day();
    const isWeekend = (dow === 0 || dow === 6) && !DB.config.allow_weekends;
    if (isHoliday || isWeekend) return [] as unknown as T;

    const result = DB.medicos.map(m => {
      const minutes = m.duracion_min ?? DB.config.slot_min;
      const wins = getWindowsForMedicoOnDate(m.id, base.toISOString());
      const slots = wins.flatMap(w => buildSlotsInWindow(base, w, minutes))
        .map(({ start, end }) => {
          const ocupado = DB.citas.some(c => c.medico_id === m.id && c.start === start && c.estado === "reservada");
          return { start, end, libre: !ocupado };
        });
      return { medico: { id: m.id, nombre: m.nombre, especialidad: m.especialidad }, slots };
    });

    return result as unknown as T;
  }

  // CREAR CITA (con regla: 1 cita por persona por día)
  if (u.pathname === "/citas" && method === "POST") {
    const body = JSON.parse(String(init?.body || "{}"));
    const personId = Number(body.person_id);
    const start = dayjs(body.start);
    const dayKey = start.format("YYYY-MM-DD");

    // regla: 1 por persona por día
    const yaTiene = DB.citas.some(c =>
      c.person_id === personId &&
      c.estado === "reservada" &&
      dayjs(c.start).format("YYYY-MM-DD") === dayKey
    );
    if (yaTiene) throw new Error("Esta persona ya tiene una cita ese día.");

    // regla: verificar que el slot siga libre
    const ocupado = DB.citas.some(c => c.medico_id === body.medico_id && c.start === body.start && c.estado === "reservada");
    if (ocupado) throw new Error("El horario ya fue tomado.");

    const id = DB.citas.length + 1;
    DB.citas.push({
      id,
      person_id: personId,
      booked_by: Number(body.booked_by) || personId,
      medico_id: Number(body.medico_id),
      start: body.start,
      end: body.end,
      estado: "reservada",
    });
    return DB.citas[DB.citas.length - 1] as unknown as T;
  }

  // MIS CITAS (por titular: trae las de todas sus personas)
  if (u.pathname === "/citas" && method === "GET") {
    const titularId = Number(u.searchParams.get("user_id"));
    const personas = personasDeTitular(titularId).map(p => p.id);
    const arr = DB.citas.filter(c => personas.includes(c.person_id));
    return arr as unknown as T;
  }

  // MEDICOS
  if (u.pathname === "/medicos" && method === "GET") {
    return DB.medicos.map(({ id, nombre, especialidad }) => ({ id, nombre, especialidad })) as unknown as T;
  }

  throw new Error(`Mock no implementado: ${method} ${u.pathname}${u.search}`);
}
