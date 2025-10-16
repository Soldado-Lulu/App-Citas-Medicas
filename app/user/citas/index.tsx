// Listado simple de citas del usuario (consume el servicio con mock/real).

import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../../src/hooks/useAuth";
import { getMisCitas } from "../../../src/services/citas.service";
import dayjs from "dayjs";

export default function MisCitas() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMisCitas(user!.id);
        if (mounted) setRows(data);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Mis citas</Text>
      {loading && <Text>Cargando...</Text>}
      {!loading && rows.length === 0 && <Text>No tienes citas.</Text>}
      {rows.map(c => (
        <View key={c.id} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>Médico ID: {c.medico_id}</Text>
          <Text >Persona ID: {c.name}</Text>
          <Text>Inicio: {dayjs(c.start).format("DD/MM/YYYY HH:mm")}</Text>
          <Text>Estado: {c.estado}</Text>
        </View>
      ))}
    </View>
  );
}
