// ───────────────────────────────────────────────────────────────
// 📄 app/user/agenda/index.tsx
// Encabezado con ficha completa del paciente + flujo de agendado
// ───────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { Page } from '@/src/ui/layout/Page';
import { Button } from '@/src/ui/primitives/Button';
import { EmptyState } from '@/src/ui/data/EmptyState';

import { useAuth } from '@/src/contexts/AuthContext';
import { getGrupoInfo } from '@/src/services/grupo.service';
import PatientDetailsCard, { PatientInfo } from '@/src/components/PatientDetailsCard';

import { useEspecialidades, useDoctores, useSlots, useConfirmarFicha } from '@/src/features/fichas/hooks';
import type { Slot } from '@/src/features/fichas/types';

export default function Agendar() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    idp?: string; nombre?: string; matricula?: string; documento?: string;
  }>();

  // Paciente objetivo (de URL o user)
  const idpParam = params.idp ? Number(params.idp) : undefined;
  const [idpoblacionSeleccionado, setIdPoblacion] =
    useState<number | undefined>(idpParam ?? user?.idpoblacion ?? undefined);

  // Traer grupo para completar ficha
  const { data: grupo } = useQuery({
    queryKey: ['grupo', user?.matricula],
    enabled: !!user?.matricula,
    queryFn: () => getGrupoInfo(user!.matricula),
    staleTime: 60_000,
  });

  const pacienteRow = (grupo || []).find(g => g.idpoblacion === idpoblacionSeleccionado) || null;

  // Mapear a PatientInfo para el card
  const ficha: PatientInfo = useMemo(() => ({
    idpoblacion: pacienteRow?.idpoblacion ?? idpoblacionSeleccionado,
    nombre_completo: pacienteRow?.nombre_completo ?? params.nombre,
    matricula: pacienteRow?.matricula ?? params.matricula,
    documento: pacienteRow?.documento ?? params.documento,
    zona: (pacienteRow as any)?.pac_zona,
    direccion: (pacienteRow as any)?.pac_direccion,
    idestablecimiento_asignado:
      (pacienteRow as any)?.idestablecimiento_asignado ??
      (pacienteRow as any)?.idestablecimiento,
    establecimiento_asignado: (pacienteRow as any)?.establecimiento_asignado,
    establecimiento_en_consulta:
      (pacienteRow as any)?.establecimiento_en_consulta ??
      (pacienteRow as any)?.Establecimiento,
    consultorio:
      (pacienteRow as any)?.consultorio_asignado ??
      (pacienteRow as any)?.Consultorio,
    telefono: (pacienteRow as any)?.telefono,
    email: (pacienteRow as any)?.email,
    fecha_nacimiento: (pacienteRow as any)?.fecha_nacimiento,
    sexo: (pacienteRow as any)?.sexo,
    parentesco: (pacienteRow as any)?.parentesco,
  }), [pacienteRow, idpoblacionSeleccionado, params]);

  // Establecimiento del usuario
  const idest = (user?.idestablecimiento ?? undefined) as number | undefined;

  // Paso a paso
  const [idespecialidad, setIdEspecialidad] = useState<number | undefined>(undefined);
  const [idpersonalmedico, setIdPersonal]   = useState<number | undefined>(undefined);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));

  const { data: especialidades, isLoading: loadingEsp } = useEspecialidades(idest);
  const { data: doctores,       isLoading: loadingDoc } = useDoctores(idest, idespecialidad);
  const { data: slots,          isLoading: loadingSlots, refetch } =
    useSlots(idest, idpersonalmedico, fecha);

  const { mutate: confirmar, isPending: confirmando } = useConfirmarFicha();
  const disponible = useMemo<Slot[]>(
    () => (slots ?? []).filter((s: Slot) => s.estado === 'Disponible'),
    [slots]
  );

  function onConfirmar(slot: Slot) {
    if (!idpoblacionSeleccionado) return;
    confirmar(
      { idfichaprogramada: slot.idfichaprogramada, idpoblacion: idpoblacionSeleccionado },
      { onSuccess: () => refetch() }
    );
  }

  if (!idest) {
    return (
      <Page>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Agendar por especialidad</Text>
        <Text style={{ color: '#6b7280', marginTop: 6 }}>
          No tienes establecimiento asignado. Pide al administrador habilitarlo.
        </Text>
      </Page>
    );
  }

  return (
    <Page>
      <Text style={{ fontSize: 20, fontWeight: '800' }}>Agendar por especialidad</Text>
      <Text style={{ color: '#6b7280', marginTop: 4 }}>Establecimiento: {String(idest)}</Text>

      {/* ✅ FICHA COMPLETA DEL PACIENTE */}
      <PatientDetailsCard data={ficha} />

      {/* Chips para cambiar de paciente dentro del mismo grupo (opcional) */}
      {grupo?.length ? (
        <FlatList
          horizontal
          data={grupo}
          keyExtractor={(p) => String(p.idpoblacion)}
          contentContainerStyle={{ gap: 8, marginTop: 12 }}
          renderItem={({ item }) => (
            <Button
              label={item.nombre_completo}
              variant={item.idpoblacion === idpoblacionSeleccionado ? 'primary' : 'ghost'}
              onPress={() => setIdPoblacion(item.idpoblacion)}
            />
          )}
        />
      ) : null}

      {/* 1) Especialidad */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>1) Selecciona especialidad</Text>
        <FlatList
          horizontal
          data={especialidades || []}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Button
              label={item.nombre}
              variant={idespecialidad === item.id ? 'primary' : 'ghost'}
              onPress={() => { setIdEspecialidad(item.id); setIdPersonal(undefined); }}
            />
          )}
          ListEmptyComponent={
            loadingEsp ? <Text>Cargando…</Text> :
            <EmptyState title="No se encontraron especialidades." />
          }
        />
      </View>

      {/* 2) Médico */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>2) Selecciona médico</Text>
        <FlatList
          horizontal
          data={idespecialidad ? (doctores || []) : []}
          keyExtractor={(e) => String(e.idpersonalmedico)}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Button
              label={item.nombre_completo}
              variant={idpersonalmedico === item.idpersonalmedico ? 'primary' : 'ghost'}
              onPress={() => setIdPersonal(item.idpersonalmedico)}
            />
          )}
          ListEmptyComponent={
            !idespecialidad ? <Text style={{ color: '#9ca3af' }}>Elige una especialidad</Text> :
            loadingDoc ? <Text>Cargando…</Text> :
            <EmptyState title="Sin médicos" subtitle="No hay médicos para esta especialidad." />
          }
        />
      </View>

      {/* 3) Fecha */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>3) Selecciona fecha</Text>
        <TextInput
          value={fecha}
          onChangeText={setFecha}
          placeholder="YYYY-MM-DD"
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, backgroundColor:'#fff' }}
        />
      </View>

      {/* 4) Horarios */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>4) Selecciona hora</Text>
        <FlatList
          data={disponible}
          keyExtractor={(s) => String(s.idfichaprogramada)}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Button label={item.hora} onPress={() => onConfirmar(item)} loading={confirmando} />
          )}
          ListEmptyComponent={
            loadingSlots ? <Text>Cargando horas…</Text> :
            <EmptyState title="No hay horarios disponibles" onRetry={refetch} />
          }
        />
      </View>
    </Page>
  );
}
