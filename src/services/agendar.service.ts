// =============================================
// src/services/agendar.service.ts
// =============================================
export type DoctorDisponible = {
  idpersonalmedico: number;
  nombre_completo: string;
  idcuaderno: number;
  especialidad: 'MEDICINA GENERAL' | 'MEDICINA FAMILIAR' | string;
};

export type SlotRow = {
  idfichaprogramada: number;
  hora: string; // HH:mm
  especialidad: 'MEDICINA GENERAL' | 'MEDICINA FAMILIAR' | string;
  idcuaderno: number;
  idpersonalmedico: number;
  medico: string;
  idconsultorio: number | null;
  consultorio: string; // "CONSULTORIO N" o "SIN CONSULTORIO ASIGNADO"
};

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getDoctoresDisponibles(params: { idest: number; fecha: string }) {
  const url = `${BASE}/agendar/doctores?idest=${params.idest}&fecha=${encodeURIComponent(params.fecha)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data?.doctores ?? []) as DoctorDisponible[];
}

export async function getSlots(params: { idpersonal: number; idest: number; fecha: string; idconsultorio?: number | null; }) {
  const query = new URLSearchParams({
    idpersonal: String(params.idpersonal),
    idest: String(params.idest),
    fecha: params.fecha,
  });
  if (params.idconsultorio != null) query.append('idconsultorio', String(params.idconsultorio));
  const url = `${BASE}/agendar/slots?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data?.slots ?? []) as SlotRow[];
}

export async function crearCita(body: { idfichaprogramada: number; idpoblacion: number; idest: number; }) {
  const url = `${BASE}/agendar`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false) throw new Error(data?.msg || `HTTP ${res.status}`);
  return data as { ok: true; cita: { idcita: number | null } };
}

