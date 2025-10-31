// app/admin/(protected)/establecimientos.tsx
// ————————————————————————————————————————————————
// Lista de Establecimientos para ADMIN (con toggle dinámico).
// - Read de establecimientos desde /api/establecimientos (SQL Server).
// - Estado de "deshabilitado" se guarda en Postgres y se maneja vía
//   /api/admin/establecimientos/disabled  (GET) y
//   /api/admin/establecimientos/:id/disabled (PATCH).
// - Paper: Appbar, Searchbar, DataTable, Switch, Snackbar.
// ————————————————————————————————————————————————

import React from 'react';
import { View } from 'react-native';
import {
  Appbar,
  Searchbar,
  DataTable,
  ActivityIndicator,
  Switch,
  Text,
  Snackbar,
} from 'react-native-paper';

import { get } from '@/src/services/http';
import { listDisabledEsts, setDisabledEst } from '@/src/services/admin-estados.service';

// Tipo que devuelve tu API de establecimientos
type Est = {
  idestablecimiento: number;
  est_nombre: string;
  est_sigla: string | null;
  idempresa: number | null;
  idsucursal: number | null;
};

// Paginación estándar
type Page<T> = { total: number; page: number; limit: number; items: T[] };

export default function Establecimientos() {
  // ——— filtros y paginación ———
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  // ——— datos y estado de carga ———
  const [items, setItems] = React.useState<Est[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // ——— ids deshabilitados (en PG) + snackbar ———
  const [disabledIds, setDisabledIds] = React.useState<number[]>([]);
  const [snack, setSnack] = React.useState<string | null>(null);

  // Carga los establecimientos paginados desde el backend (SQL Server)
  const load = async (p = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(p),
        limit: String(limit),
        ...(q ? { q } : {}),
      }).toString();

      // 👇 OJO: get<Page<Est>> tipa la respuesta para evitar "Property 'x' does not exist"
      const data = await get<Page<Est>>(`/api/establecimientos?${qs}`);
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  };

  // Carga la lista de establecimientos deshabilitados desde PG
  const loadDisabled = async () => {
    try {
      const r = await listDisabledEsts(); // { ok: true, ids: number[] }
      setDisabledIds(r.ids || []);
    } catch {
      // Si falla, no rompe la pantalla; en casos reales muestra un Snackbar.
    }
  };

  // Primera carga
  React.useEffect(() => {
    load(1);
    loadDisabled();
  }, []);

  // Helpers de toggle
  const isDisabled = (id: number) => disabledIds.includes(id);

  const toggle = async (id: number, next: boolean) => {
    // 1) UI optimista: aplicamos el cambio en memoria
    setDisabledIds((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)));

    try {
      // 2) Persistimos en backend (PG)
      await setDisabledEst(id, next);
      setSnack(next ? 'Establecimiento deshabilitado' : 'Establecimiento habilitado');
    } catch {
      // 3) Si falla, revertimos el cambio
      setDisabledIds((prev) => (next ? prev.filter((x) => x !== id) : [...prev, id]));
      setSnack('No se pudo actualizar el estado');
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <View style={{ flex: 1 }}>
      {/* Appbar superior con Refresh */}
      <Appbar.Header>
        <Appbar.Content title="Establecimientos" />
        <Appbar.Action icon="refresh" onPress={() => load(page)} />
      </Appbar.Header>

      {/* Búsqueda */}
      <View style={{ padding: 12 }}>
        <Searchbar
          placeholder="Buscar por nombre o sigla"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => load(1)} // Buscar reinicia a página 1
          returnKeyType="search"
        />
      </View>

      {/* Tabla / Loader */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Nombre</DataTable.Title>
            <DataTable.Title>Sigla</DataTable.Title>
            <DataTable.Title numeric>Empresa</DataTable.Title>
            {/* Usamos la última columna para el estado y el switch */}
            <DataTable.Title numeric>Estado</DataTable.Title>
          </DataTable.Header>

          {items.map((it) => (
            <DataTable.Row key={it.idestablecimiento}>
              <DataTable.Cell>{it.est_nombre}</DataTable.Cell>
              <DataTable.Cell>{it.est_sigla ?? '—'}</DataTable.Cell>
              <DataTable.Cell numeric>{it.idempresa ?? '—'}</DataTable.Cell>

              <DataTable.Cell numeric>
                {/* Etiqueta + Switch */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text>{isDisabled(it.idestablecimiento) ? 'Inactivo' : 'Activo'}</Text>
                  <Switch
                    value={isDisabled(it.idestablecimiento)}
                    onValueChange={(v) => toggle(it.idestablecimiento, v)}
                  />
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}

          {/* IMPORTANTE: onPageChange recibe (newPage:number) en Paper */}
          <DataTable.Pagination
            page={page - 1}
            numberOfPages={pages}
            onPageChange={(newPage: number) => load(newPage + 1)}
            label={`${(page - 1) * limit + 1}-${Math.min(page * limit, total)} de ${total}`}
            numberOfItemsPerPage={limit}
            showFastPaginationControls
          />
        </DataTable>
      )}

      {/* Snackbar de feedback */}
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2500}>
        {snack}
      </Snackbar>
    </View>
  );
}
