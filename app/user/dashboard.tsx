// ───────────────────────────────────────────────────────────────
// 📄 app/user/dashboard.tsx (COMPLETO)
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

// ✅ Usuario autenticado (contiene la matrícula del login)
import { useAuth } from '../../src/contexts/AuthContext';

// ✅ Servicios de personas (traen titular y afiliados)
import {
  getPersonaByMatricula,
  getAfiliados,
  type Persona,
} from '../../src/services/personas.service';

// ✅ Servicios de agenda (AJUSTADOS A TU BD: usan idcuaderno + idest)
import {
  getEspecialidades,        // -> getEspecialidades(idest)
  getDoctores,              // -> getDoctores(idcuaderno, idest)
  getSlots,                 // -> getSlots(idpersonal, fecha, idest)
  crearCita,
  type Doctor,
  type Especialidad,
} from '../../src/services/agenda.service';

// ✅ Resumen del grupo (consulta CTE desde backend)
import { getGrupoInfo, type GrupoInfoRow } from '../../src/services/grupo.service';
import GroupInfoModal from '@/components/GroupInfoModal';

// Iniciales del nombre (ej. "Juan Pérez" → "JP")
function getIni(full?: string | null) {
  const p = (full || '').trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'P';
}

export default function PerfilPaciente() {
  const { user } = useAuth(); // viene del login, tiene .matricula

  // —— Datos de personas
  const [titular, setTitular] = useState<Persona | null>(null);
  const [afiliados, setAfiliados] = useState<Persona[]>([]);

  // —— Estado general de carga/errores
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // —— Estados del modal de AGENDA
  const [open, setOpen] = useState(false);
  const [pacSel, setPacSel] = useState<Persona | null>(null);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [saving, setSaving] = useState(false);

  // —— Catálogos y selecciones
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [espSel, setEspSel] = useState<Especialidad | undefined>(); // ⚠️ usa idcuaderno
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [docSel, setDocSel] = useState<Doctor | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [hora, setHora] = useState<string>('');

  // —— Resumen del grupo (nuevo)
  const [grupoLoading, setGrupoLoading] = useState(false);
  const [grupo, setGrupo] = useState<GrupoInfoRow[]>([]);

  // Solo el paciente seleccionado en el modal
  const resumenSeleccionado = useMemo(
    () => (pacSel ? grupo.filter((g) => g.idpoblacion === pacSel.idpoblacion) : []),
    [grupo, pacSel]
  );

  // Establecimiento del paciente seleccionado (para filtrar catálogos)
  const idEst = useMemo<number | null>(() => {
    const p = resumenSeleccionado[0];
    // si tu CTE devuelve idest_poblacion, úsalo; si quieres usar el de consulta, cambia a otro campo
    // @ts-ignore por si aún no está en el tipo del front
    return p?.idest_poblacion ?? null;
  }, [resumenSeleccionado]);

  // ─────────────────────────────────────────────
  // 1) Cargar titular y afiliados al entrar
  // ─────────────────────────────────────────────
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

  // Para la lista, quitamos al titular de afiliados (seguridad extra)
  const afiliadosSolo = useMemo(
    () => afiliados.filter((a) => a.idpoblacion !== titular?.idpoblacion),
    [afiliados, titular]
  );

  // ─────────────────────────────────────────────
  // 2) Abrir el modal de AGENDA para un paciente
  //    Trae también el resumen del grupo desde backend
  // ─────────────────────────────────────────────
  async function abrirAgendar(p: Persona) {
    setPacSel(p);
    setHora('');
    setDocSel(undefined);
    setSlots([]);
    setEspSel(undefined);
    setDoctores([]);

    // Resumen del grupo (CTE) para conocer idEst y datos visibles
    setGrupoLoading(true);
    try {
      const data = await getGrupoInfo(user!.matricula);
      setGrupo(data);
    } finally {
      setGrupoLoading(false);
      setOpen(true);
    }
  }

  // 2.1) Cuando tengamos idEst (del paciente) → cargar especialidades filtradas
  useEffect(() => {
    (async () => {
      if (!open || !idEst) return;
      const esp = await getEspecialidades(idEst);
      setEspecialidades(esp);
      // reset dependientes
      setEspSel(undefined);
      setDoctores([]);
      setDocSel(undefined);
      setSlots([]);
      setHora('');
    })();
  }, [open, idEst]);

  // 2.2) Cuando cambia la especialidad → cargar doctores (filtrado por idEst)
  useEffect(() => {
    (async () => {
      if (!espSel || !idEst) return;
      const ds = await getDoctores(espSel.idcuaderno, idEst);
      setDoctores(ds);
      setDocSel(undefined);
      setSlots([]);
      setHora('');
    })();
  }, [espSel, idEst]);

  // 2.3) Cuando elige doctor o cambia fecha → cargar horas libres (filtrado por idEst)
 useEffect(() => {
  (async () => {
    if (!docSel || !open || !idEst) return;
    const s = await getSlots(docSel.idpersonalmedico, fecha, idEst);
    // s: { hora: string; disponible: boolean }[]
    setSlots(s.filter(x => x.disponible).map(x => x.hora)); // ← ahora es string[]
  })();
}, [docSel, fecha, open, idEst]);


  // ─────────────────────────────────────────────
  // 3) Confirmar y crear cita en backend
  // ─────────────────────────────────────────────
  async function confirmar() {
    if (!pacSel || !docSel || !fecha || !hora) return;
    setSaving(true);
    try {
      await crearCita({
        idpoblacion: pacSel.idpoblacion,
        idpersonal: docSel.idpersonalmedico,
        fecha,
        hora,
        // si tu endpoint necesita idcuaderno, agrégalo:
        // idcuaderno: espSel?.idcuaderno,
      });
      setOpen(false);
    } catch (e: any) {
      console.error('crearCita error:', e?.message);
    } finally {
      setSaving(false);
    }
  }

  // —— Estados de carga/errores de la pantalla
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

  // ─────────────────────────────────────────────
  // 4) Render principal
  // ─────────────────────────────────────────────
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

            {/* Card del TITULAR */}
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
              <TouchableOpacity style={S.btn} onPress={() => abrirAgendar(titular)}>
                <Ionicons name="calendar" size={18} color="#fff" />
                <Text style={S.btnTxt}> Agendar</Text>
              </TouchableOpacity>
            </View>

            {/* Subtítulo de afiliados */}
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
            <TouchableOpacity style={S.btn} onPress={() => abrirAgendar(item)}>
              <Ionicons name="calendar" size={18} color="#fff" />
              <Text style={S.btnTxt}> Agendar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 🗓️ Modal de agenda + Resumen de Paciente Seleccionado */}
      <GroupInfoModal
        visible={open}
        loading={grupoLoading}
        data={resumenSeleccionado} // 👈 solo el seleccionado
        onConfirm={confirmar}
        onClose={() => setOpen(false)}
      >
      


        {/* 3) Fecha */}
        <Text style={S.label}>Fecha (YYYY-MM-DD)</Text>
        <TextInput value={fecha} onChangeText={setFecha} style={S.input} />

        {/* 4) Horarios disponibles */}
        {!!docSel && (
          <>
            <Text style={S.label}>Hora</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {slots.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[S.chip, h === hora && S.chipActive]}
                  onPress={() => setHora(h)}
                >
                  <Text style={[S.chipTxt, h === hora && S.chipTxtActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
              {!slots.length && <Text style={S.muted}>Sin horarios disponibles</Text>}
            </View>
          </>
        )}
      </GroupInfoModal>
    </View>
  );
}

const S = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E3A8A', marginBottom: 8 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', margin: 16 },
  muted: { color: '#6B7280' },
  error: { color: '#EF4444', fontWeight: '700' },
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
  select: { marginVertical: 6 },
  pill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  pillTxt: { color: '#374151' },
  pillTxtActive: { color: '#3730A3', fontWeight: '700' },
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
