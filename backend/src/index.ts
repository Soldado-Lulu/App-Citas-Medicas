import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from '@/config/env';

// 👇 Importa el router central
import api from '@/modules';

const app = express();

// Middlewares globales
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check básico
app.get('/health', (_req, res) => res.json({ ok: true }));

// 👇 Usa el router centralizado
app.use('/api', api);
// Middleware global de errores
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res
    .status(500)
    .json({ ok: false, message: 'Internal error', detail: err?.message });
});

// Inicia servidor
app.listen(env.port, () =>
  console.log(`✅ API lista en: http://localhost:${env.port}`)
);
//app.listen(env.port, '0.0.0.0',() =>
  //console.log(`✅ API lista en: http:// 172.21.21.106:${env.port}`)
//);
