// app/admin/(protected)/medicos.tsx
// ————————————————————————————————————————————————
// Listado de médicos (solo lectura).
// - Búsqueda por nombre/especialidad.
// - Refresh y errores controlados con Snackbar.
// ————————————————————————————————————————————————
import React from 'react';
import { View } from 'react-native';
import { Appbar, Searchbar, List, ActivityIndicator, Snackbar } from 'react-native-paper';
import { get } from '@/src/services/http';

type Medico = { id: number; nombre: string; especialidad?: string | null };
type Page<T> = { total: number; page: number; limit: number; items: T[] };

export default function Medicos() {
  const [q, setQ] = React.useState('');
  const [items, setItems] = React.useState<Medico[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const qs = q ? `?q=${encodeURIComponent(q)}&limit=20` : '?limit=20';
      const data = await get<Page<Medico>>(`/api/medicos${qs}`);
      setItems(data.items);
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []); // carga inicial

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Médicos" />
        <Appbar.Action icon="refresh" onPress={load} />
      </Appbar.Header>

      <View style={{ padding: 12 }}>
        <Searchbar
          placeholder="Buscar por nombre o especialidad"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={load}
          returnKeyType="search"
        />
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : (
        <List.Section>
          {items.map(m => (
            <List.Item
              key={m.id}
              title={m.nombre}
              description={m.especialidad ?? '—'}
              left={props => <List.Icon {...props} icon="stethoscope" />}
            />
          ))}
        </List.Section>
      )}

      <Snackbar visible={!!err} onDismiss={() => setErr(null)} duration={3000}>
        {err}
      </Snackbar>
    </View>
  );
}
