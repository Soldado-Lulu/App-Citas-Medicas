// 📁 src/modules/establecimientos/establecimientos.routes.ts
// Definición de endpoints RESTful y documentación inline
import { Router } from 'express';
import { httpGetEstablecimiento, httpListEstablecimientos} from './establecimientos.controller';


const router = Router();


/**
* GET /api/establecimientos
* Query:
* - q: string (busca en nombre/sigla)
* - idempresa: number
* - idsucursal: number
* - page: number (1-based)
* - limit: number (1..100)
* - orderBy: 'est_nombre' | 'idestablecimiento' | 'idempresa' | 'idsucursal'
* - order: 'ASC' | 'DESC'
*/
router.get('/', httpListEstablecimientos);


/** GET /api/establecimientos/:id */
router.get('/:id', httpGetEstablecimiento);


export default router;