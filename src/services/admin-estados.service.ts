// src/services/admin-estados.service.ts
import { get, patch } from '@/src/services/http';
import { storage } from '@/src/lib/storage';

async function adminToken() {
  const t = await storage.getItem(storage.TOKENS.admin);
  if (!t) throw new Error('Sesión admin no encontrada');
  return t;
}

export async function listDisabledEsts() {
  const token = await adminToken();
  return get<{ ok: boolean; ids: number[] }>('/api/admin/establecimientos/disabled', token);
}

export async function setDisabledEst(id: number, disabled: boolean) {
  const token = await adminToken();
  return patch<{ ok: boolean; id: number; disabled: boolean }>(
    `/api/admin/establecimientos/${id}/disabled`,
    { disabled },
    token
  );
}
