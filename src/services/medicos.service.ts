// ────────────────────────────────────────────────────────────────────────────────
// 📁 src/services/medicos.service.ts (solo lectura)
export type Medico = { id: number; nombre: string; especialidad?: string | null };
import { apiGet } from './http';

export type Page<T> = { total: number; page: number; limit: number; items: T[] };

export function listMedicos(params: { q?: string; page?: number; limit?: number } = {}) {
const q = new URLSearchParams();
if (params.q) q.append('q', params.q);
if (params.page) q.append('page', String(params.page));
if (params.limit) q.append('limit', String(params.limit));
const qs = q.toString() ? `?${q.toString()}` : '';
return apiGet<Page<Medico>>(`/api/medicos${qs}`);
}