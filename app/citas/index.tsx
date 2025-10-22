import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { getEspecialidades, getDoctores, getDisponibilidadVista, confirmarFichaProgramada } from '../../src/services/citas.service';
import { Especialidad, Doctor, FichaProgramadaRow } from '../../src/domain/citas';

export default function CitasDisponibilidad() {
  const { user } = useAuth();

  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0,10));
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [espSel, setEspSel] = useState<Especialidad | undefined>();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [docSel, setDocSel] = useState<Doctor | undefined>();
  const [rows, setRows] = useState<FichaProgramadaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number|null>(null);

  // Carga especialidades al entrar
  useEffect(() => {
    (async () => setEspecialidades(await getEspecialidades()))();
  }, []);

  // Al elegir especialidad, cargar doctores
  useEffect(() => {
    (async () => {
      if (!espSel) return;
      setDoctores(await getDoctores(espSel.idespecialidad));
      setDocSel(undefined);
      setRows([]);
    })();
  }, [espSel]);

  // Buscar disponibilidad (vista de fichas)
  async function buscar() {
    if (!fecha || !docSel) return;
    setLoading(true);
    try {
      const filas = await getDisponibilidadVista({ fecha, idpersonal: docSel.idpersonalmedico, idespecialidad: espSel?.idespecialidad });
      setRows(filas);
    } finally {
      setLoading(false);
    }
  }

  // Reservar ficha programada
  async function reservar(ficha: FichaProgramadaRow) {
    if (!user?.idpoblacion) return;
    setSaving(ficha.idfichaprogramada);
    try {
      await confirmarFichaProgramada({ idfichaprogramada: ficha.idfichaprogramada, idpoblacion: user.idpoblacion });
      // quitar del listado
      setRows(prev => prev.filter(r => r.idfichaprogramada !== ficha.idfichaprogramada));
    } finally {
      setSaving(null);
    }
  }

  return (
    <View style={S.container}>
      <Text style={S.title}>Agendar cita</Text>

      {/* Filtros */}
      <Text style={S.label}>Especialidad</Text>
      <FlatList
        data={especialidades}
        keyExtractor={e=>String(e.idespecialidad)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginBottom:8}}
        renderItem={({item})=>(
          <TouchableOpacity style={[S.pill, espSel?.idespecialidad===item.idespecialidad && S.pillActive]} onPress={()=>setEspSel(item)}>
            <Text style={[S.pillTxt, espSel?.idespecialidad===item.idespecialidad && S.pillTxtActive]}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={S.label}>Doctor</Text>
      <FlatList
        data={doctores}
        keyExtractor={d=>String(d.idpersonalmedico)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginBottom:8}}
        renderItem={({item})=>(
          <TouchableOpacity style={[S.pill, docSel?.idpersonalmedico===item.idpersonalmedico && S.pillActive]} onPress={()=>setDocSel(item)} disabled={!espSel}>
            <Text style={[S.pillTxt, docSel?.idpersonalmedico===item.idpersonalmedico && S.pillTxtActive]}>{item.nombre_completo}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!espSel ? <Text style={S.muted}>Seleccione especialidad</Text> : null}
      />

      <Text style={S.label}>Fecha (YYYY-MM-DD)</Text>
      <TextInput value={fecha} onChangeText={setFecha} style={S.input} />

      <TouchableOpacity onPress={buscar} style={[S.btn, {marginTop:10, alignSelf:'flex-start', opacity: (!docSel||!fecha)?0.6:1}]} disabled={!docSel || !fecha}>
        <Ionicons name="search" size={18} color="#fff" />
        <Text style={S.btnTxt}> Buscar</Text>
      </TouchableOpacity>

      {/* Resultados */}
      {loading ? (
        <View style={S.center}><ActivityIndicator/><Text style={S.muted}>Buscando disponibilidad…</Text></View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={r=>String(r.idfichaprogramada)}
          style={{marginTop:12}}
          ItemSeparatorComponent={()=> <View style={{height:8}}/>}
          renderItem={({item})=>(
            <View style={S.card}>
              <View style={{flex:1}}>
                <Text style={S.name}>{docSel?.nombre_completo}</Text>
                <Text style={S.meta}>
                  {item.fecha} • {new Date(item.fip_fecha_ini).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  {' - '}
                  {new Date(item.fip_hora_fin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </Text>
                <Text style={S.meta}>Cobertura: <Text style={S.metaBold}>{item.Cobertura}</Text></Text>
              </View>
              <TouchableOpacity style={S.btn} onPress={()=>reservar(item)} disabled={saving!==null}>
                {saving===item.idfichaprogramada ? <ActivityIndicator color="#fff"/> : <>
                  <Ionicons name="calendar" size={18} color="#fff" />
                  <Text style={S.btnTxt}> Reservar</Text>
                </>}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={[S.muted,{marginTop:12}]}>Sin horas libres</Text>}
        />
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F8FAFC', padding:16 },
  center:{ alignItems:'center', justifyContent:'center', gap:6, padding:20 },
  title:{ fontSize:22, fontWeight:'800', color:'#0F172A', marginBottom:8 },
  label:{ marginTop:8, fontWeight:'700', color:'#111827' },
  input:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, paddingHorizontal:10, height:42, backgroundColor:'#fff' },
  card:{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#E5E7EB' },
  name:{ fontSize:16, fontWeight:'700', color:'#111827' },
  meta:{ color:'#6B7280', marginTop:2 },
  metaBold:{ fontWeight:'600', color:'#374151' },
  muted:{ color:'#6B7280' },
  pill:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:999, paddingHorizontal:12, paddingVertical:6, marginRight:8, backgroundColor:'#fff' },
  pillActive:{ backgroundColor:'#EEF2FF', borderColor:'#C7D2FE' },
  pillTxt:{ color:'#374151' },
  pillTxtActive:{ color:'#3730A3', fontWeight:'700' },
  btn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#2563EB', paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  btnTxt:{ color:'#fff', fontWeight:'700' },
});
