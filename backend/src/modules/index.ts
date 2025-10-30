// 📁 src/modules/index.ts
// Este archivo centraliza todas las rutas del proyecto
// Así el index.ts principal se mantiene limpio y mantenible

import { Router } from 'express';
import citasRoutes from './citas/citas.routes';
// Importa cada grupo de rutas (módulos)
import authRoutes from './auth/auth.routes';
import adminRoutes from './admin/admin.routes';
import fichasRoutes from './fichas/fichas.routes';
import establecimientosRoutes from './establecimientos/establecimientos.routes';
import medicosRoutes from './medicos/medicos.routes';
// ⚡️ Aquí puedes seguir agregando más módulos en el futuro
import agendarRoutes from './agendar/agendar.routes';
// Creamos el router principal que agrupa todo
const api = Router();
api.use('/citas', citasRoutes);
// Montamos las rutas bajo sus prefijos
api.use('/auth', authRoutes);
api.use('/admin', adminRoutes);
api.use('/fichas', fichasRoutes);
api.use('/establecimientos', establecimientosRoutes);
api.use('/medicos',medicosRoutes); // Ejemplo de otro módulo
api.use('/agendar', agendarRoutes);
// Exportamos para usarlo en src/index.ts
// (opcional) endpoint para listar rutas cargadas
api.get('/__routes', (_req, res) => {
  res.json({
    ok: true,
    mounted: ['/auth', '/admin', '/fichas', '/medicos'],
  });
});

export default api;
