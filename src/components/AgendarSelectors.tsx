// =============================================
// src/components/AgendarSelectors.tsx
// (Se inserta dentro de <GroupInfoModal>{...}</GroupInfoModal>)
// =============================================
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import dayjs from 'dayjs';
import { getDoctoresDisponibles, getSlots, crearCita, type DoctorDisponible, type SlotRow } from '@/services/agendar.service';

export type AgendarSelectorsProps = {
  idest: number;              // Establecimiento del usuario
  idpoblacion: number;        // Población del usuario
  idconsultorio?: number | null; // Si ya tiene consultorio asignado
  defaultFecha?: string;      // YYYY-MM-DD
  onBooked?: (idcita: number | null) => void;
};

const Btn = ({ title, onPress, variant = 'primary', disabled }: any) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => ({
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: disabled ? '#9CA3AF' : variant === 'primary' ? '#2563EB' : '#fff',
      borderWidth: 1,
      borderColor: variant === 'primary' ? 'transparent' : '#E5E7EB',
      opacity: pressed ? 0.9 : 1,
    })}
  >
    <Text style={{ color: variant === 'primary' ? '#fff' : '#111827', fontWeight: '600', textAlign: 'center' }}>{title}</Text>
  </Pressable>
);

export default function AgendarSelectors({ idest, idpoblacion, idconsultorio = null, defaultFecha, onBooked }: AgendarSelectorsProps) {
  const [fecha, setFecha] = useState<string>(defaultFecha || dayjs().format('YYYY-MM-DD'));
  const [especialidad, setEspecialidad] = useState<'TODAS' | 'MEDICINA GENERAL' | 'MEDICINA FAMILIAR'>('TODAS');

  const [loadingDocs, setLoadingDocs] = useState(false);
  const [doctores, setDoctores] = useState<DoctorDisponible[]>([]);
  const [doctor, setDoctor] = useState<DoctorDisponible | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<SlotRow[]>([]);

  const doctoresFiltrados = useMemo(() => {
    if (especialidad === 'TODAS') return doctores;
    return doctores.filter(d => d.especialidad.toUpperCase() === especialidad);
  }, [doctores, especialidad]);

  async function cargarDoctores() {
    try {
      setLoadingDocs(true);
      const rows = await getDoctoresDisponibles({ idest, fecha });
      setDoctores(rows);
      setDoctor(null);
      setSlots([]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo listar doctores');
    } finally {
      setLoadingDocs(false);
    }
  }

  async function cargarSlots() {
    if (!doctor) return;
    try {
      setLoadingSlots(true);
      const rows = await getSlots({ idpersonal: doctor.idpersonalmedico, idest, fecha, idconsultorio: idconsultorio ?? undefined });
      setSlots(rows);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo listar horarios');
    } finally {
      setLoadingSlots(false);
    }
  }

  async function agendar(slot: SlotRow) {
    try {
      const resp = await crearCita({ idfichaprogramada: slot.idfichaprogramada, idpoblacion, idest });
      Alert.alert('Listo', `Cita creada (ID: ${resp.cita.idcita ?? '—'})`);
      onBooked?.(resp.cita.idcita ?? null);
      await cargarSlots();
    } catch (e:any) {
      Alert.alert('No se pudo crear la cita', e.message || 'Intenta nuevamente');
    }
  }

  useEffect(() => { cargarDoctores(); }, [idest, fecha]);

  return (
    <View style={{ gap: 12 }}>
      {/* Fecha + Filtro MG/MF */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={fecha}
          onChangeText={setFecha}
          placeholder="YYYY-MM-DD"
          autoCapitalize='none'
          style={{ flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' }}
        />
        <Btn
          title={especialidad === 'TODAS' ? 'Filtrar MG' : (especialidad === 'MEDICINA GENERAL' ? 'Filtrar MF' : 'Todas')}
          variant='secondary'
          onPress={() => setEspecialidad(especialidad === 'TODAS' ? 'MEDICINA GENERAL' : (especialidad === 'MEDICINA GENERAL' ? 'MEDICINA FAMILIAR' : 'TODAS'))}
        />
      </View>

      {/* Doctores */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Doctores</Text>
          {loadingDocs && <ActivityIndicator />}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {doctoresFiltrados.map((d) => (
            <Pressable key={`${d.idpersonalmedico}-${d.idcuaderno}`}
              onPress={() => { setDoctor(d); setSlots([]); }}
              style={({ pressed }) => ({
                paddingVertical: 10, paddingHorizontal: 12,
                borderRadius: 10, borderWidth: 1,
                borderColor: doctor?.idpersonalmedico === d.idpersonalmedico ? '#2563EB' : '#E5E7EB',
                backgroundColor: doctor?.idpersonalmedico === d.idpersonalmedico ? '#EFF6FF' : '#fff',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontWeight: '700' }}>{d.nombre_completo}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>{d.especialidad}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Horarios */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Horarios</Text>
          <Btn title="Cargar horarios" variant='secondary' onPress={cargarSlots} disabled={!doctor} />
        </View>
        {loadingSlots && <ActivityIndicator />}
        {!loadingSlots && slots.length === 0 && (
          <Text style={{ color: '#6B7280' }}>Selecciona un doctor y carga los horarios</Text>
        )}
        <View style={{ gap: 8 }}>
          {slots.map((s) => (
            <View key={s.idfichaprogramada} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10 }}>
              <View>
                <Text style={{ fontWeight: '700' }}>{s.hora}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{s.especialidad} • {s.consultorio}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{s.medico}</Text>
              </View>
              <Btn title="Agendar" onPress={() => agendar(s)} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// =============================================
// Cómo integrarlo en tu vista existente (ejemplo)
// app/user/dashboard.tsx (fragmento)
// =============================================
/**
 * Supongamos que ya tienes GroupInfoModal y obtienes `GrupoInfoRow` con:
 *  - establecimiento_asignado → nombre
 *  - idest_poblacion         → id del establecimiento del usuario (o un campo similar que ya tengas)
 *  - consultorio_asignado    → idconsultorio si lo tienes (opcional)
 *  - idpoblacion             → del usuario
 */

// import AgendarSelectors from '@/components/AgendarSelectors';
// import GroupInfoModal from '@/components/GroupInfoModal';

// Dentro del componente Dashboard (cuando abres el modal):
// <GroupInfoModal visible={open} data={[grupoSeleccionado]} onClose={()=>setOpen(false)} onConfirm={()=>{}}>
//   <AgendarSelectors
//     idest={Number((grupoSeleccionado as any).idest_poblacion)}
//     idpoblacion={Number(grupoSeleccionado.idpoblacion)}
//     idconsultorio={(grupoSeleccionado as any).consultorio_asignado ?? null}
//     defaultFecha={new Date().toISOString().slice(0,10)}
//     onBooked={(idcita)=>{
//       // refresca listado, cierra modal, etc.
//     }}
//   />
// </GroupInfoModal>
