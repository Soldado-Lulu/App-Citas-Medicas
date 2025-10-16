import { http } from "./apiClient";

export type AdminCita = {
  id: number;
  person_id: number;
  booked_by: number;
  medico_id: number;
  medico_nombre: string;
  medico_especialidad: string;
  start: string;
  end: string;
  estado: "reservada" | "cancelada" | "atendida";
  paciente: string;
};

export async function getTodasCitas() {
  return http<AdminCita[]>("/admin/citas");
}

export type Especialidad = { id: number; nombre: string };
export async function getEspecialidades() {
  return http<Especialidad[]>("/especialidades");
}
export async function crearEspecialidad(nombre: string) {
  return http<Especialidad>("/especialidades", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export type MedicoInput = { nombre: string; especialidad: string; duracion_min?: number };
export async function crearMedico(body: MedicoInput) {
  return http("/medicos", { method: "POST", body: JSON.stringify(body) });
}
export async function getMedicosAdmin() {
  return http<Array<{ id:number; nombre:string; especialidad:string; duracion_min:number }>>("/medicos");
}
