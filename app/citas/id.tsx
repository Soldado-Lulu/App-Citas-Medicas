import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CitaDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
      <Text>Detalle de cita #{id}</Text>
      {/* Aquí puedes llamar a /api/fichas/citas/:id para más info */}
    </View>
  );
}
