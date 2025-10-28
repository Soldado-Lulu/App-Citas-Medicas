// 📁 src/services/establecimientos.service.ts
export type Establecimiento = {
idestablecimiento: number;
idempresa: number | null;
est_nombre: string;
est_codigo_snis: number | null;
idsucursal: number | null;
est_sigla: string | null;
activo?: boolean; // si existe en tu tabla, se mostrará en la UI
};


export type Page<T> = { total: number; page: number; limit: number; items: T[] };

import { get } from './http';



export function listEstablecimientos(params: { q?: string; page?: number; limit?: number } = {}) {
const q = new URLSearchParams();
if (params.q) q.append('q', params.q);
if (params.page) q.append('page', String(params.page));
if (params.limit) q.append('limit', String(params.limit));
const qs = q.toString() ? `?${q.toString()}` : '';
return get<Page<Establecimiento>>(`/api/establecimientos${qs}`);
}


export function getEstablecimiento(id: number) {
return get<Establecimiento>(`/api/establecimientos/${id}`);
}


// NOTA: API READ-ONLY — las funciones de CUD se omiten intencionalmente.
// Si en el futuro habilitas endpoints, agrega aquí create/update/delete/toggle.