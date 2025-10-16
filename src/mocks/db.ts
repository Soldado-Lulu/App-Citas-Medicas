// src/mocks/db.ts
export type Window = { start: string; end: string };
export type DiaSemana = 1|2|3|4|5|6|0;

export const DB = {
  users: [
    { id: 1, name: "Asegurado Uno", role: "user" as const, matricula: "12345" },
    { id: 2, name: "Asegurado Dos", role: "user" as const, matricula: "22345" },
    { id: 3, name: "Admin",        role: "admin" as const, matricula: "9900"  },
  ],
  afiliados: [
    { id: 101, titular_id: 1, name: "Hijo Uno",   relation: "Hijo" },
    { id: 102, titular_id: 1, name: "Esposa Uno", relation: "Esposa" },
    { id: 201, titular_id: 2, name: "Hija Dos",   relation: "Hija" },
  ],
  config: { days_ahead: 2, allow_weekends: false, slot_min: 20, feriados: <string[]>[] },

  especialidades: [
    { id: 1, nombre: "Medicina General" },
    { id: 2, nombre: "Pediatría" },
  ],

  medicos: [
    {
      id: 1, nombre: "Dr. Pérez", especialidad: "Medicina General", duracion_min: 20,
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{start:"08:00", end:"12:00"}, {start:"14:00", end:"18:00"}],
        2: [{start:"08:00", end:"12:00"}],
        3: [{start:"08:00", end:"12:00"}],
        4: [{start:"08:00", end:"12:00"}, {start:"14:00", end:"18:00"}],
        5: [{start:"08:00", end:"12:00"}], 6: [], 0: []
      }
    },
    {
      id: 2, nombre: "Dra. Gómez", especialidad: "Pediatría", duracion_min: 15,
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{start:"08:00", end:"12:00"}],
        2: [{start:"08:00", end:"12:00"}, {start:"15:00", end:"19:00"}],
        3: [{start:"08:00", end:"12:00"}],
        4: [{start:"08:00", end:"12:00"}],
        5: [{start:"08:00", end:"12:00"}], 6: [], 0: []
      }
    },
  ],

  // 👇 REGISTRO DE CITAS — NO pongas user_id aquí, usa booked_by y person_id
  citas: [] as Array<{
    id: number;
    person_id: number;   // paciente (titular o afiliado)
    booked_by: number;   // titular que hizo la reserva
    medico_id: number;
    start: string;
    end: string;
    estado: "reservada" | "cancelada" | "atendida";
  }>,
};
