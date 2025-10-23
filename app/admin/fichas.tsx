// app/admin/fichas.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authFetch } from '../../src/lib/api';

type Ficha = {
  id: number | string;
  paciente?: string;
  documento?: string;
  fecha?: string;  // ISO
  estado?: string; // p.ej. 'pendiente' | 'confirmada'
};

export default function AdminFichasScreen() {
  const router = useRouter();
  const [data, setData] = useState<Ficha[]>([]);
  const [filtered, setFiltered] = useState<Ficha[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchFichas = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      // Ajusta si tu API usa otro shape de respuesta
      const res = await authFetch('/api/fichas');
      const list: Ficha[] = Array.isArray(res) ? res : res?.items || [];
      setData(list);
      setFiltered(list);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar fichas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFichas();
    } finally {
      setRefreshing(false);
    }
  }, [fetchFichas]);

  // Búsqueda simple (paciente, documento, estado)
  useEffect(() => {
    if (!q.trim()) {
      setFiltered(data);
      return;
    }
    const s = q.trim().toLowerCase();
    setFiltered(
      data.filter((f) =>
        [f.paciente, f.documento, f.estado]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s))
      )
    );
  }, [q, data]);

  const renderItem = useCallback(({ item }: { item: Ficha }) => {
    return (
      <TouchableOpacity
        style={{
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: '#fff',
        }}
        onPress={() => router.push({ pathname: '/citas/id', params: { id: String(item.id) } })}
      >
        <Text style={{ fontWeight: '700', fontSize: 16 }}>
          {item.paciente || 'Paciente sin nombre'}
        </Text>
        <Text style={{ color: '#6b7280', marginTop: 2 }}>
          Doc: {item.documento || '—'} · Estado: {item.estado || '—'}
        </Text>
        <Text style={{ color: '#9ca3af', marginTop: 2 }}>
          Fecha: {formatFechaCorta(item.fecha)}
        </Text>
      </TouchableOpacity>
    );
  }, [router]);

  const keyExtractor = useCallback((it: Ficha) => String(it.id), []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Fichas',
          headerRight: () => (
            <TouchableOpacity onPress={onRefresh} style={{ paddingHorizontal: 8 }}>
              <Text style={{ color: '#2563eb', fontWeight: '700' }}>Refrescar</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar por paciente, documento o estado…"
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              backgroundColor: '#fff',
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
            {err ? <Text style={{ color: 'tomato', marginTop: 8 }}>{err}</Text> : null}
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ padding: 16, gap: 12 }}
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>
                  {q ? 'Sin resultados para tu búsqueda' : 'No hay fichas'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

function formatFechaCorta(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}
