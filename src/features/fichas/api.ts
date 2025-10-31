import { http } from "@/src/lib/api-client";
import type { Especialidad, Doctor, Slot, ConfirmarPayload, Cita } from "./types";

export const fichasApi = {
  especialidades: (idest: number) => http.get<Especialidad[]>(`/agenda/establecimientos/${idest}/especialidades`),
  doctoresPorEspecialidad: (idest: number, idespecialidad: number) => http.get<Doctor[]>(`/agenda/establecimientos/${idest}/especialidades/${idespecialidad}/doctores`),
  slots: (idest: number, idpersonalmedico: number, fecha: string) => http.get<Slot[]>(`/agenda/establecimientos/${idest}/doctores/${idpersonalmedico}/slots?fecha=${encodeURIComponent(fecha)}`),
  confirmar: (payload: ConfirmarPayload) => http.post<{ ok: boolean; idcita: number }>(`/agenda/confirmar`, payload),
  misCitas: (idpoblacionTitular: number) => http.get<Cita[]>(`/citas/grupo/${idpoblacionTitular}`),
};
