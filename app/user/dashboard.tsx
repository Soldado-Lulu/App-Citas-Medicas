// ───────────────────────────────────────────────────────────────
// 📄 app/user/dashboard.tsx
// Dashboard del paciente:
//  • Muestra TITULAR y, debajo, AFILIADOS (sin duplicar).
//  • Permite agendar una cita: Especialidad(idcuaderno) → Doctor → Hora.
//  • Crea la cita en el backend.
// ───────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
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

// ✅ Servicios de agenda (AJUSTADOS A TU BD: usan idcuaderno)
import {
  getEspecialidades,        // -> [{ idcuaderno, nombre }]
  getDoctores,              // -> getDoctores(idcuaderno)
  getSlots,                 // -> getSlots(idpersonal, fecha)
  crearCita,                // -> crearCita({ idpoblacion, idpersonal, fecha, hora, idcuaderno? })
  type Doctor,
  type Especialidad,        // -> { idcuaderno:number; nombre:string }
} from '../../src/services/agenda.service';

// ————————————————————————————————————————————————
// 🔠 Iniciales del nombre (ej. "Juan Pérez" → "JP")
// ————————————————————————————————————————————————
function getIni(full?: string | null) {
  const p = (full || '').trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'P';
}

// ————————————————————————————————————————————————
// 🧍‍♂️ Pantalla principal
// ————————————————————————————————————————————————
export default function PerfilPaciente() {
  const { user } = useAuth(); // viene del login, tiene .matricula

  // —— Datos de personas
  const [titular, setTitular] = useState<Persona | null>(null);
  const [afiliados, setAfiliados] = useState<Persona[]>([]);

  // —— Estado general de carga/errores
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // —— Estados del modal de AGENDA
  const [open, setOpen] = useState(false);             // visible/oculto
  const [pacSel, setPacSel] = useState<Persona | null>(null); // paciente para agendar
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [saving, setSaving] = useState(false);

  // —— Catálogos y selecciones
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [espSel, setEspSel] = useState<Especialidad | undefined>(); // ⚠️ usa idcuaderno
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [docSel, setDocSel] = useState<Doctor | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [hora, setHora] = useState<string>('');

  // ─────────────────────────────────────────────
  // 1) Cargar titular y afiliados al entrar
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.matricula) return;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // 1.1) Trae titular por matrícula (coincide con historia o código)
        const t = await getPersonaByMatricula(user.matricula);
        setTitular(t);

        // 1.2) Trae afiliados del mismo grupo (excluimos titular luego)
        const af = await getAfiliados(t.idpoblacion);
        setAfiliados(af);
      } catch (e: any) {
        setErr(e?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.matricula]);

  // Filtra afiliados por si backend devuelve también al titular (seguridad extra)
  const afiliadosSolo = useMemo(
    () => afiliados.filter((a) => a.idpoblacion !== titular?.idpoblacion),
    [afiliados, titular]
  );

  // ─────────────────────────────────────────────
  // 2) Abrir el modal de AGENDA para un paciente
  // ─────────────────────────────────────────────
  async function abrirAgendar(p: Persona) {
    setPacSel(p);
    setHora('');
    setDocSel(undefined);
    setSlots([]);

    // Cargar especialidades una sola vez
    if (!especialidades.length) {
      const esp = await getEspecialidades(); // ← devuelve { idcuaderno, nombre }
      setEspecialidades(esp);
    }

    // Forzar que elija la especialidad cada vez que abre
    setEspSel(undefined);
    setDoctores([]);

    setOpen(true);
  }

  // 2.1) Cuando cambia la especialidad → cargar doctores
  useEffect(() => {
    (async () => {
      if (!espSel) return;
      // ⚠️ A TU BD: getDoctores usa idcuaderno
      const ds = await getDoctores(espSel.idcuaderno);
      setDoctores(ds);
      setDocSel(undefined);
      setSlots([]);
      setHora('');
    })();
  }, [espSel]);

  // 2.2) Cuando elige doctor o cambia fecha → cargar horas libres
  useEffect(() => {
    (async () => {
      if (!docSel || !open) return;
      const s = await getSlots(docSel.idpersonalmedico, fecha);
      setSlots(s);
    })();
  }, [docSel, fecha, open]);

  // ─────────────────────────────────────────────
  // 3) Confirmar y crear cita en backend
  // ─────────────────────────────────────────────
  async function confirmar() {
    if (!pacSel || !docSel || !fecha || !hora) return;
    setSaving(true);
    try {
      // En tu backend aceptas (mínimo): idpoblacion, idpersonal, fecha, hora.
      // Si además guardas el cuaderno (especialidad) agrega idcuaderno:
      await crearCita({
        idpoblacion: pacSel.idpoblacion,
        idpersonal: docSel.idpersonalmedico,
        fecha,
        hora,
        // idcuaderno opcional (descomentar si tu backend lo admite)
        // idcuaderno: espSel?.idcuaderno,
      });
      setOpen(false); // cerrar modal tras crear la cita
    } catch (e: any) {
      // Si quieres, aquí puedes mostrar un toast con e.message
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
        // —— Encabezado: tarjeta del TITULAR + subtítulo "Afiliados"
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={S.title}>Mi grupo familiar</Text>

            {/* Card del titular */}
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
        // —— Render de cada AFILIADO
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

      {/* ─────────────────────────────────────────
          🗓️ Modal de agenda
          Flujo: Especialidad(idcuaderno) → Doctor → Hora
         ───────────────────────────────────────── */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={S.modalBg}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>Nueva cita</Text>
            <Text style={S.muted}>{pacSel?.nombre_completo}</Text>

            {/* 1) Especialidad (idcuaderno) */}
            <Text style={S.label}>Especialidad</Text>
            <View style={S.select}>
              <FlatList
                data={especialidades}
                keyExtractor={(e) => String(e.idcuaderno)}     // 👈 idcuaderno
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[S.pill, espSel?.idcuaderno === item.idcuaderno && S.pillActive]}
                    onPress={() => setEspSel(item)}
                  >
                    <Text
                      style={[S.pillTxt, espSel?.idcuaderno === item.idcuaderno && S.pillTxtActive]}
                    >
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* 2) Doctor (se habilita al elegir especialidad) */}
            <Text style={S.label}>Doctor</Text>
            <View style={S.select}>
              <FlatList
                data={doctores}
                keyExtractor={(d) => String(d.idpersonalmedico)}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      S.pill,
                      docSel?.idpersonalmedico === item.idpersonalmedico && S.pillActive,
                    ]}
                    onPress={() => setDocSel(item)}
                    disabled={!espSel} // evitar selección sin especialidad
                  >
                    <Text
                      style={[
                        S.pillTxt,
                        docSel?.idpersonalmedico === item.idpersonalmedico && S.pillTxtActive,
                      ]}
                    >
                      {item.nombre_completo}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  !espSel ? <Text style={S.muted}>Seleccione una especialidad</Text> : null
                }
              />
            </View>

            {/* 3) Fecha (puedes cambiarlo luego por un DatePicker nativo) */}
            <Text style={S.label}>Fecha (YYYY-MM-DD)</Text>
            <TextInput value={fecha} onChangeText={setFecha} style={S.input} />

            {/* 4) Horarios disponibles del doctor seleccionado */}
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

            {/* Botones del modal */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={S.muted}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={saving || !pacSel || !docSel || !hora}
                onPress={confirmar}
                style={[S.btn, { paddingHorizontal: 14, opacity: saving || !docSel || !hora ? 0.7 : 1 }]}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={S.btnTxt}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────
// 🎨 Estilos
// ─────────────────────────────────────────────
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
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
