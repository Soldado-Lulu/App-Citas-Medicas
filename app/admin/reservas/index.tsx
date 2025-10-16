
import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import dayjs from "@/lib/dayjs";
import { getTodasCitas, AdminCita } from "../../../src/services/admin.service";

export default function AdminReservas() {
  const [rows, setRows] = useState<AdminCita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTodasCitas();
        if (mounted) setRows(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Todas las citas</Text>
      {loading && <Text>Cargando...</Text>}
      {!loading && rows.length === 0 && <Text>No hay citas.</Text>}

      {rows.map(c => (
        <View key={c.id} style={{ borderWidth: 1, borderRadius: 8, padding: 12, backgroundColor: "#fff" }}>
          <Text style={{ fontWeight: "600" }}>
            {c.medico_nombre} — {c.medico_especialidad}
          </Text>
          <Text>Paciente: {c.paciente}</Text>
          <Text>Fecha: {dayjs(c.start).format("DD/MM/YYYY")} — Hora: {dayjs(c.start).format("HH:mm")}</Text>
          <Text>Estado: {c.estado.toUpperCase()}</Text>
        </View>
        
      ))}
    </ScrollView>
  );
}
