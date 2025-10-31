import React from 'react';
import { View, Text } from 'react-native';

// Ajusta/expande según lo que devuelva tu backend
export type PatientInfo = {
  idpoblacion?: number;
  nombre_completo?: string;
  matricula?: string;
  documento?: string;

  // Ubicación
  zona?: string;
  direccion?: string;

  // Asignación / Consulta
  //idestablecimiento_asignado?: number | string;
  establecimiento_asignado?: string;
  establecimiento_en_consulta?: string;
  consultorio?: string;

  // Extras
  telefono?: string;
  email?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  parentesco?: string;
};

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
      <Text style={{ fontWeight: '700', color: '#111827' }}>{label}:</Text>
      <Text style={{ color: '#111827' }}>{value}</Text>
    </View>
  );
}

export default function PatientDetailsCard({ data }: { data: PatientInfo }) {
  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
      }}
    >
      {data?.nombre_completo ? (
        <Text style={{ fontWeight: '800', marginBottom: 6 }}>{data.nombre_completo}</Text>
      ) : null}

      {/* Datos personales */}
      <Text style={{ fontWeight: '800', marginTop: 4, marginBottom: 4 }}>Datos personales</Text>
      <Row label="Matrícula" value={data.matricula} />
      <Row label="Documento" value={data.documento} />
      <Row label="Fecha de nacimiento" value={data.fecha_nacimiento} />
      <Row label="Sexo" value={data.sexo} />
      <Row label="Teléfono" value={data.telefono} />
      <Row label="Email" value={data.email} />
      <Row label="Parentesco" value={data.parentesco} />

      {/* Ubicación */}
      {(data.zona || data.direccion) ? (
        <>
          <Text style={{ fontWeight: '800', marginTop: 10, marginBottom: 4 }}>Ubicación</Text>
          <Row label="Zona" value={data.zona} />
          <Row label="Dirección" value={data.direccion} />
        </>
      ) : null}

      {/* Asignación / Consulta*/}
      {/*data.idestablecimiento_asignado ||*/}
      {(
        data.establecimiento_asignado ||
        data.establecimiento_en_consulta ||
        data.consultorio) ? (
        <>
          <Text style={{ fontWeight: '800', marginTop: 10, marginBottom: 4 }}>
            Asignación / Consulta
          </Text>
          {/*<Row label="Estab. asignado" value={data.idestablecimiento_asignado ?? data.establecimiento_asignado} />*/}
          <Row label="Estab. en consulta" value={data.establecimiento_en_consulta} />
          <Row label="Consultorio" value={data.consultorio} />
          
        </>
      ) : null}
    </View>
  );
}
