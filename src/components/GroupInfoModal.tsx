// src/components/GroupInfoModal.tsx
import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import KeyValueList from '@/components/KeyValueList';
import type { GrupoInfoRow } from '@/services/grupo.service';

type Props = {
  visible: boolean;
  loading?: boolean;
  data: GrupoInfoRow[];     // ← SOLO el seleccionado (ya filtras en el dashboard)
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode; // ← Contenido extra: Selectores de Especialidad → Doctor → Fecha → Hora
};

// Helpers mínimos
const fmtDate = (d?: string | null) => (d ? String(d).slice(0, 10) : '—');
const dash = (v: any) => (v === null || v === undefined || v === '' ? '—' : v);

export default function GroupInfoModal({
  visible,
  loading,
  data,
  onConfirm,
  onClose,
  children,
}: Props) {
  // Por diseño, llega un solo item. Igual soportamos varios por seguridad.
  const list = useMemo(() => data ?? [], [data]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Nueva cita</Text>
        <Text style={{ color: '#6B7280' }}>Resumen del grupo</Text>

        {loading ? (
          <View style={{ alignItems: 'center', padding: 8 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>Cargando datos…</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ gap: 10 }}>
            {list.length === 0 && (
              <Text style={{ color: '#6B7280' }}>Sin datos disponibles</Text>
            )}

            {list.map((p) => (
              <View
                key={p.idpoblacion}
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#FAFAFA',
                  gap: 8,
                }}
              >
                {/* Encabezado */}
                <View style={{ gap: 2 }}>
                  <Text style={{ fontWeight: '800' }}>{dash(p.nombre_completo)}</Text>
                  <Text style={{ color: '#6B7280' }}>
                  </Text>
                </View>

                {/* Sección: Datos personales */}
                <View style={{ gap: 4 }}>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>Datos personales</Text>
                  <KeyValueList
                    items={[
                      { label: 'Matrícula', value: p.matricula },
                     // { label: 'Código afiliado', value: p.codigo_afiliado },
                      { label: 'Documento', value: p.documento },
                      // Si el backend ya devuelve edad
                      // @ts-ignore (por si no está aún en tu tipo)
                     // { label: 'Edad', value: (p as any).edad },
                      //{ label: 'Teléfono', value: (p as any).pac_telefono },
                      { label: 'Zona', value: (p as any).pac_zona },
                      { label: 'Dirección', value: (p as any).pac_direccion },
                    ]}
                  />
                </View>

                {/* Sección: Afiliación 
                <View style={{ gap: 4 }}>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>Afiliación</Text>
                  <KeyValueList
                    items={[
                      { label: 'Estado afiliación', value: (p as any).estadoafiliacion },
                      { label: 'Inicio afiliación', value: fmtDate((p as any).pac_fecha_afiliacion) },
                      { label: 'Fin cobertura', value: fmtDate((p as any).pac_fin_cobertura) },
                      { label: 'Id empresa', value: (p as any).idempresa },
                      { label: 'Id est. población', value: (p as any).idest_poblacion },
                    ]}
                  />
                </View>
              */}
                {/* Sección: Asignación/Consulta */}
                <View style={{ gap: 4 }}>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>Asignación / Consulta</Text>
                  <KeyValueList
                    items={[
                      { label: 'Estab. asignado', value: p.establecimiento_asignado },
                      { label: 'Estab. en consulta', value: p.establecimiento_en_consulta },
                      { label: 'Consultorio', value: p.consultorio_asignado },
                  //    { label: 'Id cuaderno', value: p.idcuaderno },
                    ]}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Selectores: Especialidad → Doctor → Fecha → Hora */}
        {children}

        {/* Botonera */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={onClose}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text>Cancelar</Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#2563eb',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Confirmar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
