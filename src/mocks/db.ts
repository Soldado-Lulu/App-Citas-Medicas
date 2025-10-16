// src/mocks/db.ts
// "Base de datos" en memoria, con configuración global y horarios por médico.

export type Window = { start: string; end: string }; // "08:00", "12:00"
export type DiaSemana = 1|2|3|4|5|6|0; // 1=Lu ... 6=Sáb, 0=Dom (como Date.getDay)

export const DB = {
  // Usuarios de demo
  users: [
    { id: 1, name: "Asegurado", role: "user" as const, matricula: "12345" },
    { id: 2, name: "Admin",    role: "admin" as const, matricula: "9900"  },
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
      // duración propia (si quieres distinto de config.slot_min)
      duracion_min: 20,
      // Horarios por día de la semana. Puedes definir mañana/tarde, o solo mañana.
      // 1=Lu ... 5=Vi, 6=Sáb, 0=Dom
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
        2: [{ start: "08:00", end: "12:00" }],
        3: [{ start: "08:00", end: "12:00" }],
        4: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
        5: [{ start: "08:00", end: "12:00" }],
        6: [], // sábado (vacío = no atiende)
        0: [], // domingo
      },
    },
    {
      id: 2,
      nombre: "Dra. Gómez",
      especialidad: "Pediatría",
      duracion_min: 15, // esta doctora atiende cada 15 min
      horarios: <Record<DiaSemana, Window[]>>{
        1: [{ start: "08:00", end: "12:00" }],
        2: [{ start: "08:00", end: "12:00" }, { start: "15:00", end: "19:00" }],
        3: [{ start: "08:00", end: "12:00" }],
        4: [{ start: "08:00", end: "12:00" }],
        5: [{ start: "08:00", end: "12:00" }],
        6: [], // sábado
        0: [], // domingo
      },
    },
  ],

  // Citas reservadas
  citas: [] as Array<{
    id: number;
    user_id: number;
    medico_id: number;
    start: string; // ISO
    end: string;   // ISO
    estado: "reservada" | "cancelada" | "atendida";
  }>,
};
