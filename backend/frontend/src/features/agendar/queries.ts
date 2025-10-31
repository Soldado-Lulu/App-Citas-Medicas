// src/features/agendar/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useEspecialidades = (idest: number) =>
  useQuery({ queryKey: ['especialidades', idest], queryFn: () => api.getEspecialidades(idest) });

export const useMedicos = (idest: number, especialidad?: string) =>
  useQuery({
    queryKey: ['medicos', idest, especialidad ?? ''],
    queryFn: () => api.getMedicos(idest, especialidad!),
    enabled: !!idest && !!especialidad,
  });

export const useConsultorios = (idest: number) =>
  useQuery({ queryKey: ['consultorios', idest], queryFn: () => api.getConsultorios(idest) });

export const useFechas = (p: { idest: number; medicoId?: number; especialidad?: string }) =>
  useQuery({
    queryKey: ['fechas', p],
    queryFn: () => api.getFechas(p),
    enabled: !!p.idest && (!!p.medicoId || !!p.especialidad),
  });

export const useHoras = (p: {
  idest: number; fecha: string; medicoId?: number; consultorioId?: number; especialidad?: string;
}) =>
  useQuery({
    queryKey: ['horas', p],
    queryFn: () => api.getHoras(p),
    enabled: !!p.idest && !!p.fecha,
  });

export const useCrearCita = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.crearCita,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['horas'] });
      qc.invalidateQueries({ queryKey: ['fechas'] });
      qc.invalidateQueries({ queryKey: ['mis-citas'] });
    },
  });
};
