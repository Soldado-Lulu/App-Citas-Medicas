// app/(protected)/user/agendar/index.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useEspecialidades, useMedicos, useFechas, useHoras, useCrearCita } from '@/src/features/agendar/queries';

// Simula datos del paciente actual que ya tienes en tu contexto/dashboard:
const CURRENT = {
  idpoblacion: 12345,             // <- reemplaza con el real
  idestablecimiento: 7,           // <- desde getGrupoInfo o tu sesión
};

export default function AgendarScreen() {
  const [especialidad, setEspecialidad] = useState<string | undefined>();
  const [medicoId, setMedicoId] = useState<number | undefined>();
  const [fecha, setFecha] = useState<string | undefined>();
  const [slot, setSlot] = useState<any | null>(null);

  // 1) Cargar opciones
  const { data: especialidades, isLoading: loadEsp } = useEspecialidades(CURRENT.idestablecimiento);
  const { data: medicos, isLoading: loadMed } = useMedicos(CURRENT.idestablecimiento, especialidad);
  const { data: fechas, isLoading: loadFech } = useFechas({ idest: CURRENT.idestablecimiento, medicoId, especialidad });
  const { data: horas, isLoading: loadHoras } = useHoras({
    idest: CURRENT.idestablecimiento,
    fecha: fecha || '',
    medicoId,
    especialidad,
  });

  // 2) Mutación para crear cita
  const crear = useCrearCita();

  const disabledConfirm = !slot || crear.isPending;

  const onConfirm = () => {
    if (!slot) return;
    crear.mutate({
      idpoblacion: CURRENT.idpoblacion,
      idestablecimiento: CURRENT.idestablecimiento,
      idfichaprogramada: slot.idfichaprogramada,
      idpersonalmedico: slot.idpersonalmedico,
      idcuaderno: slot.idcuaderno,
      idconsultorio: slot.idconsultorio ?? null,
      fecha: fecha!,
      hora: slot.hora,
    }, {
      onSuccess: () => {
        Alert.alert('Listo', 'Tu cita fue reservada');
        setSlot(null);
      },
      onError: (e: any) => {
        Alert.alert('Ups', e?.message || 'No se pudo reservar el horario');
      },
    });
  };

  // Render helper
  const Item = ({ label, selected, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={{
      padding: 12, marginVertical: 6, borderRadius: 10,
      borderWidth: 1, borderColor: selected ? '#2563eb' : '#e5e7eb',
      backgroundColor: selected ? '#dbeafe' : 'white'
    }}>
      <Text style={{ fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Agendar cita</Text>

      {/* Especialidad */}
      <Text style={{ marginTop: 8, fontWeight: '600' }}>1. Especialidad</Text>
      {loadEsp ? <ActivityIndicator/> : (
        <FlatList
          horizontal
          data={especialidades || []}
          keyExtractor={(it: any) => it.especialidad}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Item
              label={`${item.especialidad} (${item.cupos})`}
              selected={especialidad === item.especialidad}
              onPress={() => {
                setEspecialidad(item.especialidad);
                setMedicoId(undefined);
                setFecha(undefined);
                setSlot(null);
              }}
            />
          )}
        />
      )}

      {/* Médico */}
      {especialidad && (
        <>
          <Text style={{ marginTop: 8, fontWeight: '600' }}>2. Médico</Text>
          {loadMed ? <ActivityIndicator/> : (
            <FlatList
              horizontal
              data={medicos || []}
              keyExtractor={(it: any) => String(it.idpersonalmedico)}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Item
                  label={`${item.nombre_completo ?? 'Médico'} (${item.cupos})`}
                  selected={medicoId === item.idpersonalmedico}
                  onPress={() => {
                    setMedicoId(item.idpersonalmedico);
                    setFecha(undefined);
                    setSlot(null);
                  }}
                />
              )}
            />
          )}
        </>
      )}

      {/* Fecha */}
      {medicoId && (
        <>
          <Text style={{ marginTop: 8, fontWeight: '600' }}>3. Fecha</Text>
          {loadFech ? <ActivityIndicator/> : (
            <FlatList
              horizontal
              data={fechas || []}
              keyExtractor={(it: any) => it.fecha}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Item
                  label={`${item.fecha} (${item.cupos})`}
                  selected={fecha === item.fecha}
                  onPress={() => {
                    setFecha(item.fecha);
                    setSlot(null);
                  }}
                />
              )}
            />
          )}
        </>
      )}

      {/* Horas */}
      {fecha && (
        <>
          <Text style={{ marginTop: 8, fontWeight: '600' }}>4. Hora</Text>
          {loadHoras ? <ActivityIndicator/> : (
            <FlatList
              data={horas || []}
              keyExtractor={(it: any) => String(it.idfichaprogramada)}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Item
                  label={`${item.hora} · ${item.consultorio}`}
                  selected={slot?.idfichaprogramada === item.idfichaprogramada}
                  onPress={() => setSlot(item)}
                />
              )}
            />
          )}
        </>
      )}

      {/* Confirmación */}
      <TouchableOpacity
        disabled={disabledConfirm}
        onPress={onConfirm}
        style={{
          marginTop: 'auto', padding: 14, borderRadius: 12,
          backgroundColor: disabledConfirm ? '#93c5fd' : '#2563eb'
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
          {crear.isPending ? 'Reservando…' : 'Confirmar reserva'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
