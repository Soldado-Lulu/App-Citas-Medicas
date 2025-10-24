
import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Appbar, Searchbar, Card, Text, ActivityIndicator } from 'react-native-paper';
import { listMedicos, type Medico } from '@/services/medicos.service';


export default function MedicosListScreen() {
const [q, setQ] = React.useState('');
const [page, setPage] = React.useState(1);
const [data, setData] = React.useState<Medico[]>([]);
const [total, setTotal] = React.useState(0);
const [loading, setLoading] = React.useState(false);
const [refreshing, setRefreshing] = React.useState(false);


const fetchPage = React.useCallback(async (reset = false) => {
setLoading(true);
try {
const res = await listMedicos({ q, page: reset ? 1 : page, limit: 10 });
setTotal(res.total);
setPage(res.page);
setData((prev) => (reset ? res.items : [...prev, ...res.items]));
} finally {
setLoading(false);
}
}, [q, page]);


React.useEffect(() => { fetchPage(true); }, [q]);
React.useEffect(() => { if (page > 1) fetchPage(); }, [page]);


const loadMore = () => {
const max = Math.ceil(total / 10);
if (!loading && page < max) setPage((p) => p + 1);
};


return (
<View style={{ flex: 1 }}>
<Appbar.Header><Appbar.Content title="Médicos" /></Appbar.Header>
<View style={{ padding: 12 }}>
<Searchbar placeholder="Buscar por nombre o especialidad…" value={q} onChangeText={setQ} />
</View>
<FlatList
data={data}
keyExtractor={(it) => String(it.id)}
contentContainerStyle={{ padding: 12, gap: 8 }}
onEndReached={loadMore}
onEndReachedThreshold={0.4}
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPage(true).finally(() => setRefreshing(false)); }} />}
renderItem={({ item }) => (
<Card mode="outlined" style={{ borderRadius: 16 }}>
<Card.Title title={item.nombre} subtitle={item.especialidad ?? '—'} />
</Card>
)}
ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
/>
</View>
);
}