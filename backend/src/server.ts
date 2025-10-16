import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { catalogos } from './routes/catalogos.js';
import { personas } from './routes/personas.js';
import { citas } from './routes/citas.js';
import{auth} from './routes/auth.js';
import { disponibilidad } from './routes/disponibilidad.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/disponibilidad', disponibilidad);
app.use(auth);
app.get('/health', (_req,res)=>res.json({ ok:true, at:new Date().toISOString() }));

app.use(catalogos);
app.use(personas);
app.use(citas);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
