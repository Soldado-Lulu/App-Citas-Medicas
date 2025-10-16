// src/mocks/db.ts
// "Base de datos" en memoria, con configuración global y horarios por médico y afiliados.

export type Window = { start: string; end: string }; // "08:00", "12:00"
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 0;   // 1=Lu ... 6=Sáb, 0=Dom

export const DB = {
  // Usuarios titulares de demo (3)
  users: [
    { id: 1, name: "Asegurado Uno", role: "user" as const, matricula: "12345" },
    { id: 2, name: "Asegurado Dos", role: "user" as const, matricula: "22345" },
    { id: 3, name: "Admin",        role: "admin" as const, matricula: "9900"  },
  ],

  // Afiliados (dependientes) de los usuarios (2 para el usuario 1, 1 para el usuario 2)
  afiliados: [
    { id: 101, titular_id: 1, name: "Hijo Uno",   relation: "Hijo" },
    { id: 102, titular_id: 1, name: "Esposa Uno", relation: "Esposa" },
    { id: 201, titular_id: 2, name: "Hija Dos",   relation: "Hija" },
  ],

  // Configuración global de agenda
  config: {
    days_ahead: 2,          // cuántos días hábiles se habilitan
    allow_weekends: false,  // permitir o no sábados/domingos
    slot_min: 20,           // duración del turno en minutos (default)
    feriados: <string[]>[], // lista de strings "YYYY-MM-DD"
  },

  // Médicos
  medicos: [
    {
      id: 1,
      nombre: "Dr. Pérez",
      especialidad: "Medicina General",
      duracion_min: 20,
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
        2: [{ start: "08:00", end: "12:00" }],
        3: [{ start: "08:00", end: "12:00" }],
        4: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
        5: [{ start: "08:00", end: "12:00" }],
        6: [],
        0: [],
      },
    },
    {
      id: 2,
      nombre: "Dra. Gómez",
      especialidad: "Pediatría",
      duracion_min: 15,
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{ start: "08:00", end: "12:00" }],
        2: [{ start: "08:00", end: "12:00" }, { start: "15:00", end: "19:00" }],
        3: [{ start: "08:00", end: "12:00" }],
        4: [{ start: "08:00", end: "12:00" }],
        5: [{ start: "08:00", end: "12:00" }],
        6: [],
        0: [],
      },
    },
  ],

  // Citas reservadas
  // Nota: aquí 'person_id' puede ser el titular o un afiliado
  citas: [] as Array<{
    id: number;
    person_id: number;   // 👈 persona para la que se reserva (titular o afiliado)
    booked_by: number;   // titular que reservó (para auditoría)
    medico_id: number;
    start: string;       // ISO
    end: string;         // ISO
    estado: "reservada" | "cancelada" | "atendida";
  }>,
};
