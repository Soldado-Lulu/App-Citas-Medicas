// src/services/citas.service.ts
import { get, post } from './http';
import type {
  FichaProgramadaRow,
  FiltroDisponibilidad,
  Especialidad,
  Doctor,
  CitaCreada,
} from '../domain/citas';

// ------- Catálogos (AJUSTADOS A TU BACKEND) --------
// GET /api/fichas/especialidades?idest=120
export async function getEspecialidades(idest: number) {
  const r = await get<{ ok: boolean; especialidades: Especialidad[] }>(
    `/api/fichas/especialidades?idest=${encodeURIComponent(idest)}`
  );
  return r.especialidades;
}

// GET /api/fichas/doctores?idcuaderno=3017&idest=120
export async function getDoctores(idcuaderno: number, idest: number) {
  const qs = new URLSearchParams({
    idcuaderno: String(idcuaderno),
    idest: String(idest),
  }).toString();
  const r = await get<{ ok: boolean; doctores: Doctor[] }>(`/api/fichas/doctores?${qs}`);
  return r.doctores;
}

// ------- Disponibilidad (GENÉRICA) --------
// Úsala solo si de verdad necesitas consultar por doctor/esp/est externo.
// Para el caso del USUARIO → usa listarMisSlots/contarMisSlots (abajo).
export async function getDisponibilidadVista(filter: FiltroDisponibilidad) {
  const params = new URLSearchParams();
  params.set('fecha', filter.fecha);
  if (filter.idespecialidad) params.set('idespecialidad', String(filter.idespecialidad));
  if (filter.idpersonal) params.set('idpersonal', String(filter.idpersonal));
  if (filter.idestablecimiento) params.set('idestablecimiento', String(filter.idestablecimiento));

  const r = await get<{ ok: boolean; filas: FichaProgramadaRow[] }>(
    `/api/fichas/disponibilidad?${params.toString()}`
  );
  return r.filas;
}

// ------- Confirmar cita DESDE una ficha programada --------
// POST /api/fichas/citas/programada  { idfichaprogramada, idpoblacion }
export async function confirmarFichaProgramada(input: {
  idfichaprogramada: number;
  idpoblacion: number;
}) {
  const r = await post<{ ok: boolean; cita: CitaCreada }>(`/api/fichas/citas/programada`, input);
  return r.cita;
}

// ------- Mis citas del grupo (si tu backend ya lo expone) --------
export async function getMisCitasGrupo(idpoblacionTitular: number) {
  const r = await get<{
    ok: boolean;
    citas: Array<{
      idcita: number;
      idpoblacion: number;
      paciente: string;
      doctor: string;
      especialidad: string | null;
      fecha: string; // YYYY-MM-DD
      hora: string;  // HH:mm
      estado: string;
    }>;
  }>(`/api/fichas/citas/grupo/${idpoblacionTitular}`);
  return r.citas;
}

// ====== ENDPOINTS ESPECÍFICOS PARA EL USUARIO (consultorio propio) ======
// GET /citas/mis-slots/contador?fecha=YYYY-MM-DD  (o ?desde&hasta)
export async function contarMisSlots(params: { fecha?: string; desde?: string; hasta?: string }) {
  const q = new URLSearchParams();
  if (params.fecha) q.set('fecha', params.fecha);
  if (params.desde) q.set('desde', params.desde);
  if (params.hasta) q.set('hasta', params.hasta);

  // Usa el wrapper `get` (ya agrega Authorization, baseURL, etc.)
  const r = await get<{
    ok: boolean;
    consultorio: { idcuaderno: number; idestablecimiento: number };
    total: number;
    porDia: Array<{ fecha: string; libres: number }>;
  }>(`/citas/mis-slots/contador?${q.toString()}`);

  return r;
}

// GET /citas/mis-slots?fecha=YYYY-MM-DD
export async function listarMisSlots(fecha: string) {
  const r = await get<{
    ok: boolean;
    consultorio: { idcuaderno: number; idestablecimiento: number };
    count: number;
    slots: string[];
    fichas: { idfichaprogramada: number; hora: string }[];
  }>(`/citas/mis-slots?fecha=${encodeURIComponent(fecha)}`);

  // si solo quieres horas, puedes devolver r.slots; para crear cita usa r.fichas
  return r;
}
