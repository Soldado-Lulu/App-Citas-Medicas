export type Especialidad = { id: number; nombre: string; };
export type Doctor = { idpersonalmedico: number; nombre_completo: string; idcuaderno: number; especialidad: string; };
export type Slot = { idfichaprogramada: number; fecha: string; hora: string; idpersonalmedico: number; idcuaderno: number; estado: "Disponible" | "Asignado"; consultorio?: string | null; };
export type ConfirmarPayload = { idfichaprogramada: number; idpoblacion: number; observacion?: string; };
export type Cita = { idcita: number; paciente: string; especialidad: string; medico: string; fecha: string; hora: string; estado: "Confirmada" | "Atendida" | "Cancelada"; };
