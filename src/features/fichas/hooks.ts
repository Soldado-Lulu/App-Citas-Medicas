// src/features/fichas/hooks.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { fichasApi } from './api';
import type { Especialidad, Doctor, Slot, ConfirmarPayload, Cita } from './types';

export function useEspecialidades(idest?: number | null): UseQueryResult<Especialidad[]> {
  return useQuery<Especialidad[]>({
    queryKey: ['especialidades', idest],
    enabled: idest != null,
    queryFn: () => fichasApi.especialidades(idest as number),
    staleTime: 60_000,
  });
}

export function useDoctores(idest?: number | null, idespecialidad?: number | null): UseQueryResult<Doctor[]> {
  return useQuery<Doctor[]>({
    queryKey: ['doctores', idest, idespecialidad],
    enabled: idest != null && idespecialidad != null,
    queryFn: () => fichasApi.doctoresPorEspecialidad(idest as number, idespecialidad as number),
    staleTime: 60_000,
  });
}

export function useSlots(idest?: number | null, idpersonalmedico?: number | null, fecha?: string | null): UseQueryResult<Slot[]> {
  return useQuery<Slot[]>({
    queryKey: ['slots', idest, idpersonalmedico, fecha],
    enabled: idest != null && idpersonalmedico != null && !!fecha,
    queryFn: () => fichasApi.slots(idest as number, idpersonalmedico as number, fecha as string),
    refetchInterval: 15_000,
  });
}

export function useConfirmarFicha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmarPayload) => fichasApi.confirmar(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['misCitas'] });
    },
  });
}

export function useMisCitas(idpoblacionTitular?: number | null): UseQueryResult<Cita[]> {
  return useQuery<Cita[]>({
    queryKey: ['misCitas', idpoblacionTitular],
    enabled: idpoblacionTitular != null,
    queryFn: () => fichasApi.misCitas(idpoblacionTitular as number),
  });
}
