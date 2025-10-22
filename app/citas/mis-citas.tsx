import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { getPersonaByMatricula } from '../../src/services/personas.service';
import { getMisCitasGrupo } from '../../src/services/citas.service';

export default function MisCitas() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.matricula) return;
    (async () => {
      setLoading(true);
      const titular = await getPersonaByMatricula(user.matricula);
      const citas = await getMisCitasGrupo(titular.idpoblacion);
      setRows(citas);
      setLoading(false);
    })();
  }, [user?.matricula]);

  if (loading) return <View style={S.center}><ActivityIndicator/><Text style={S.muted}>Cargando…</Text></View>;

  return (
    <View style={S.container}>
      <Text style={S.title}>Mis citas</Text>
      <FlatList
        data={rows}
        keyExtractor={(i)=>String(i.idcita)}
        ItemSeparatorComponent={()=> <View style={{height:8}}/>}
        renderItem={({item})=>(
          <View style={S.card}>
            <View style={{flex:1}}>
              <Text style={S.name}>{item.paciente}</Text>
              <Text style={S.meta}>{item.especialidad || '—'} • {item.doctor}</Text>
              <Text style={S.metaBold}>{item.fecha} • {item.hora}  —  {item.estado}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={S.muted}>No tienes citas próximas.</Text>}
      />
    </View>
  );
}

const S = StyleSheet.create({
  container:{flex:1, backgroundColor:'#F8FAFC', padding:16},
  center:{flex:1, alignItems:'center', justifyContent:'center', gap:6},
  title:{ fontSize:22, fontWeight:'800', color:'#0F172A', marginBottom:8 },
  card:{ backgroundColor:'#fff', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E5E7EB' },
  name:{ fontSize:16, fontWeight:'700', color:'#111827' },
  meta:{ color:'#6B7280' },
  metaBold:{ color:'#0F172A', fontWeight:'700' },
  muted:{ color:'#6B7280' },
});
