// src/features/agendar/agendar.routes.ts
import { Router } from 'express';
import {
  listEspecialidades, listMedicos, listConsultorios,
  listFechas, listHoras, crearCita
} from './agendar.controller';

const r = Router();

r.get('/especialidades', listEspecialidades);
r.get('/medicos', listMedicos);
r.get('/consultorios', listConsultorios);
r.get('/fechas', listFechas);
r.get('/horas', listHoras);
r.post('/citas', crearCita);

export default r;
