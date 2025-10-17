import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// 👇 ESTE import exacto
import { env } from '@/config/env';

import fichasRoutes from '@/modules/fichas/fichas.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/fichas', fichasRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Internal error', detail: err?.message });
  
});

app.listen(env.port, () => console.log(`API http://localhost:${env.port}`));
