
// ────────────────────────────────────────────────────────────────────────────────
// 📁 app/admin/establecimientos/index.tsx
import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Appbar, Text, Searchbar, Card, Snackbar, ActivityIndicator, Chip } from 'react-native-paper';
import { listEstablecimientos, type Establecimiento } from '@/services/establecimientos.service';


export default function EstablecimientosListScreen() {
const [q, setQ] = React.useState('');
const [page, setPage] = React.useState(1);
const [data, setData] = React.useState<Establecimiento[]>([]);
const [total, setTotal] = React.useState(0);
const [loading, setLoading] = React.useState(false);
const [refreshing, setRefreshing] = React.useState(false);
const [error, setError] = React.useState<string | null>(null);
const [snack, setSnack] = React.useState<string | null>(null);


const fetchPage = React.useCallback(async (reset = false) => {
try {
setLoading(true);
const res = await listEstablecimientos({ q, page: reset ? 1 : page, limit: 10 });
setTotal(res.total);
setPage(res.page);
setData((prev) => (reset ? res.items : [...prev, ...res.items]));
} catch (e: any) {
setError(e.message);
} finally {
setLoading(false);
}
}, [q, page]);


React.useEffect(() => { fetchPage(true); }, [q]);


const onRefresh = React.useCallback(async () => {
setRefreshing(true);
await fetchPage(true);
setRefreshing(false);
}, [fetchPage]);


const loadMore = () => {
const maxPage = Math.ceil(total / 10);
if (!loading && page < maxPage) {
setPage((p) => p + 1);
}
};


React.useEffect(() => { if (page > 1) fetchPage(); }, [page]);


return (
<View style={{ flex: 1 }}>
<Appbar.Header>
<Appbar.Content title="Establecimientos" />
<Appbar.Action icon="refresh" onPress={() => fetchPage(true)} />
</Appbar.Header>


<View style={{ padding: 12 }}>
<Searchbar placeholder="Buscar por nombre o sigla…" value={q} onChangeText={setQ} />
</View>


{error ? (
<View style={{ padding: 16 }}><Text>{error}</Text></View>
) : (
<FlatList
data={data}
keyExtractor={(it) => String(it.idestablecimiento)}
contentContainerStyle={{ padding: 12, gap: 8 }}
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
onEndReached={loadMore}
onEndReachedThreshold={0.4}
renderItem={({ item }) => (
<Card mode="outlined" style={{ borderRadius: 16 }}>
<Card.Title
title={item.est_nombre}
subtitle={`Sigla: ${item.est_sigla ?? '—'} • Empresa: ${item.idempresa ?? '—'} • Sucursal: ${item.idsucursal ?? '—'}`}
right={() => (
<Chip compact style={{ marginRight: 12 }}>
{item.activo === false ? 'Inactivo' : 'Activo'}
</Chip>
)}
/>
</Card>
)}
ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
/>
)}


<Snackbar visible={!!snack} onDismiss={() => setSnack(null)}>{snack}</Snackbar>
</View>
);
}