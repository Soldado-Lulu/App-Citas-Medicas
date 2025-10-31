// src/services/especialidades.service.ts
import { aget, apost } from './http-auth';

export type Especialidad = {
  idcuaderno: number;
  nombre: string;
  sigla: string;
  idtipoespecialidad: number;
  cua_hora_inicio: string;
  cua_hora_fin: string;
  cua_estado: string | number;
};

export async function listarEspecialidades(idest: number, buscar = '') {
  const qs = new URLSearchParams({ idest: String(idest), buscar });
  const r = await aget<{ ok: boolean; data: Especialidad[] }>(`/api/especialidades?${qs.toString()}`);
  return r.data;
}

export async function disponibilidadPorDia(idcuaderno: number, idest: number, desde: string, hasta?: string) {
  const qs = new URLSearchParams({ idest: String(idest), desde, ...(hasta ? { hasta } : {}) });
  const r = await aget<{ ok: boolean; data: { fecha: string; libres: number }[] }>(`/api/especialidades/${idcuaderno}/disponibilidad?${qs.toString()}`);
  return r.data;
}

export async function slotsLibres(idcuaderno: number, idest: number, fecha: string) {
  const qs = new URLSearchParams({ idest: String(idest), fecha });
  const r = await aget<{ ok: boolean; data: { idfichaprogramada: number; hora_inicio: string; hora_fin: string }[] }>(`/api/especialidades/${idcuaderno}/slots?${qs.toString()}`);
  return r.data;
}

export async function reservarFicha(idcuaderno: number, idfichaprogramada: number) {
  const r = await apost<{ ok: boolean; msg: string; reserva: any; ficha: any }>(`/api/especialidades/${idcuaderno}/reservar`, { idfichaprogramada });
  return r;
}
