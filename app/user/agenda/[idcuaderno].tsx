// app/user/agenda/[idcuaderno].tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { useDisponibilidad, useSlots, reservar } from '../../../src/hooks/useAgendaEspecialidad';

export default function AgendaEspecialidad() {
  const { idcuaderno, idest } = useLocalSearchParams<{ idcuaderno: string; idest: string }>();
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const desde = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const hasta = useMemo(() => dayjs().add(14, 'day').format('YYYY-MM-DD'), []);

  const { data: dias, loading: loadingDias } = useDisponibilidad(Number(idcuaderno), Number(idest), desde, hasta);
  const { slots, loading: loadingSlots, reload } = useSlots(Number(idcuaderno), Number(idest), fecha);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Especialidad #{idcuaderno}</Text>

      <Text style={{ marginTop: 6 }}>Fechas con disponibilidad</Text>
      {loadingDias ? <ActivityIndicator/> : (
        <FlatList
          horizontal
          data={dias}
          keyExtractor={(d) => d.fecha}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFecha(item.fecha)}
              style={{
                paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
                borderWidth: 1, borderColor: fecha === item.fecha ? '#0a7' : '#ddd',
                backgroundColor: fecha === item.fecha ? '#eafff6' : 'white'
              }}
            >
              <Text>{dayjs(item.fecha).format('DD/MM')}</Text>
              <Text style={{ fontSize: 12, color: '#555' }}>{item.libres} libres</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={{ marginTop: 6 }}>Horarios disponibles para {dayjs(fecha).format('DD/MM/YYYY')}</Text>
      {loadingSlots ? <ActivityIndicator/> : (
        <FlatList
          data={slots}
          keyExtractor={(s) => String(s.idfichaprogramada)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={async () => {
                try {
                  const r = await reservar(Number(idcuaderno), item.idfichaprogramada);
                  Alert.alert('Reserva', r.msg || 'Reserva registrada');
                  reload();
                } catch (e: any) {
                  Alert.alert('Error', e.message);
                }
              }}
              style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 8 }}
            >
              <Text style={{ fontWeight: '600' }}>{item.hora_inicio} - {item.hora_fin}</Text>
              <Text style={{ color: '#555' }}>Ficha #{item.idfichaprogramada}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#777' }}>Sin horarios disponibles</Text>}
        />
      )}
    </View>
  );
}
