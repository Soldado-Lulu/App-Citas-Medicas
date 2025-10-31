// ───────────────────────────────────────────────────────────────
// 📄 app/user/dashboard.tsx
// Muestra grupo familiar, datos del titular/afiliados y permite:
//  - Agendar rápido (modal por ficha) mostrando ficha COMPLETA del paciente
//  - Ir a Agendar por especialidad con datos del paciente (params)
// ───────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/src/contexts/AuthContext';
import {
  getPersonaByMatricula,
  getAfiliados,
  type Persona,
} from '@/src/services/personas.service';
import { getGrupoInfo, type GrupoInfoRow } from '@/src/services/grupo.service';
import { listarMisSlots, confirmarFichaProgramada } from '@/src/services/citas.service';

// Utilidad: iniciales del nombre (Juan Pérez → JP)
function getIni(full?: string | null) {
  const p = (full || '').trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'P';
}

export default function PerfilPaciente() {
  const { user } = useAuth();
  const router = useRouter();

  // Datos de personas
  const [titular, setTitular] = useState<Persona | null>(null);
  const [afiliados, setAfiliados] = useState<Persona[]>([]);

  // Carga/errores
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Modal agendado rápido
  const [open, setOpen] = useState(false);
  const [pacSel, setPacSel] = useState<Persona | null>(null);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // Horarios (fichas)
  const [fichas, setFichas] = useState<{ idfichaprogramada: number; hora: string }[]>([]);
  const [hora, setHora] = useState<string>('');
  const [idfichaSel, setIdfichaSel] = useState<number | null>(null);

  // Resumen de grupo para modal
  const [grupoLoading, setGrupoLoading] = useState(false);
  const [grupo, setGrupo] = useState<GrupoInfoRow[]>([]);

  const resumenSeleccionado = useMemo(
    () => (pacSel ? grupo.filter((g) => g.idpoblacion === pacSel.idpoblacion) : []),
    [grupo, pacSel]
  );

  // Cargar titular y afiliados
  useEffect(() => {
    if (!user?.matricula) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const t = await getPersonaByMatricula(user.matricula);
        setTitular(t);

        const af = await getAfiliados(t.idpoblacion);
        setAfiliados(af);
      } catch (e: any) {
        setErr(e?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.matricula]);

  const afiliadosSolo = useMemo(
    () => afiliados.filter((a) => a.idpoblacion !== titular?.idpoblacion),
    [afiliados, titular]
  );
{/*


  // Abre modal de agenda rápida y precarga resumen + fichas del día
  async function abrirAgendar(p: Persona) {
    setPacSel(p);
    setHora('');
    setIdfichaSel(null);
    setFichas([]);

    setGrupoLoading(true);
    try {
      const data = await getGrupoInfo(user!.matricula);
      setGrupo(data);
    } finally {
      setGrupoLoading(false);
      setOpen(true);
    }
  }
*/}
  // Traer fichas cuando el modal está abierto o cambia la fecha
  useEffect(() => {
    (async () => {
      if (!open || !fecha) return;
      try {
        const r = await listarMisSlots(fecha); // { fichas: [{ idfichaprogramada, hora }], ... }
        setFichas(r.fichas ?? []);
        setHora('');
        setIdfichaSel(null);
      } catch {
        setFichas([]);
      }
    })();
  }, [open, fecha]);

  // Confirmar cita por ficha
  async function confirmar() {
    if (!pacSel || !idfichaSel) return;
    setSaving(true);
    try {
      await confirmarFichaProgramada({
        idfichaprogramada: idfichaSel,
        idpoblacion: pacSel.idpoblacion,
      });
      setOpen(false);
    } catch (e: any) {
      console.error('confirmarFichaProgramada error:', e?.message);
    } finally {
      setSaving(false);
    }
  }

  // Ir a agendar por especialidad con datos del paciente
  function irAgendarEspecialidad(p: Persona) {
    router.push({
      pathname: '/user/agenda',
      params: {
        idp: String(p.idpoblacion),
        nombre: p.nombre_completo || '',
        matricula: p.matricula || '',
        documento: p.documento || '',
        
      },
    });
  }


  if (loading)
    return (
      <View style={S.center}>
        <ActivityIndicator />
        <Text style={S.muted}>Cargando…</Text>
      </View>
    );

  if (err || !titular)
    return (
      <View style={S.center}>
        <Text style={S.error}>{err || 'No se encontró información'}</Text>
      </View>
    );

  return (
    <View style={S.container}>
      <FlatList
        data={afiliadosSolo}
        keyExtractor={(i) => String(i.idpoblacion)}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={S.title}>Mi grupo familiar</Text>

            {/* TITULAR */}
            <Text style={S.sectionTitle}>Titular</Text>
            <View style={S.card}>
              <View style={S.avatar}>
                <Text style={S.avatarTxt}>{getIni(titular.nombre_completo)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.name}>{titular.nombre_completo}</Text>
                <Text style={S.meta}>
                  Matrícula: <Text style={S.metaBold}>{titular.matricula || '—'}</Text>
                  {'  '}• CI: <Text style={S.metaBold}>{titular.documento || '—'}</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={[S.btn, { backgroundColor: '#111827', marginLeft: 8 }]}
                onPress={() => irAgendarEspecialidad(titular)}
              >
                <Ionicons name="calendar" size={18} color="#fff" />
                <Text style={S.btnTxt}>  Agendar cita</Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.sectionTitle, { marginTop: 16 }]}>Afiliados</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={S.card}>
            <View style={S.avatar}>
              <Text style={S.avatarTxt}>{getIni(item.nombre_completo)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.name}>{item.nombre_completo}</Text>
              <Text style={S.meta}>
                Matrícula: <Text style={S.metaBold}>{item.matricula || '—'}</Text>
                {'  '}• CI: <Text style={S.metaBold}>{item.documento || '—'}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[S.btn, { backgroundColor: '#111827', marginLeft: 8 }]}
              onPress={() => irAgendarEspecialidad(item)}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
              <Text style={S.btnTxt}>  Agendar cita</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', margin: 16 },
  muted: { color: '#6B7280' },
  error: { color: '#EF4444', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E3A8A', marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarTxt: { color: '#1D4ED8', fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  meta: { color: '#6B7280', marginTop: 2 },
  metaBold: { fontWeight: '600', color: '#374151' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnTxt: { color: '#fff', fontWeight: '700' },
  label: { marginTop: 8, fontWeight: '700', color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    backgroundColor: '#fff',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  chipTxt: { color: '#374151' },
  chipTxtActive: { color: '#065F46', fontWeight: '700' },
});
