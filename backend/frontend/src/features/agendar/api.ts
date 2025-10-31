// src/features/agendar/api.ts
import { api } from '@/src/lib/api-client';

export const getEspecialidades = (idest: number) =>
  api.get(`/agendar/especialidades?idest=${idest}`);

export const getMedicos = (idest: number, especialidad: string) =>
  api.get(`/agendar/medicos?idest=${idest}&especialidad=${encodeURIComponent(especialidad)}`);

export const getConsultorios = (idest: number) =>
  api.get(`/agendar/consultorios?idest=${idest}`);

export const getFechas = (params: { idest: number; medicoId?: number; especialidad?: string }) => {
  const q = new URLSearchParams();
  q.set('idest', String(params.idest));
  if (params.medicoId) q.set('medicoId', String(params.medicoId));
  if (params.especialidad) q.set('especialidad', params.especialidad);
  return api.get(`/agendar/fechas?${q.toString()}`);
};

export const getHoras = (params: {
  idest: number; fecha: string; medicoId?: number; consultorioId?: number; especialidad?: string;
}) => {
  const q = new URLSearchParams();
  q.set('idest', String(params.idest));
  q.set('fecha', params.fecha);
  if (params.medicoId) q.set('medicoId', String(params.medicoId));
  if (params.consultorioId) q.set('consultorioId', String(params.consultorioId));
  if (params.especialidad) q.set('especialidad', params.especialidad);
  return api.get(`/agendar/horas?${q.toString()}`);
};

export const crearCita = (body: {
  idpoblacion: number; idestablecimiento: number;
  idfichaprogramada: number; idpersonalmedico: number; idcuaderno: number;
  idconsultorio?: number | null; fecha: string; hora: string;
}) => api.post('/agendar/citas', body);
