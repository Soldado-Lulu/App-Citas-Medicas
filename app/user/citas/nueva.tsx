// Flujo de "nueva cita": muestra 2 días hábiles desde hoy y slots disponibles.
// Al elegir un slot, crea la cita (mock) y muestra un alert.

import { useMemo, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import dayjs from "dayjs";
import { nextAllowedDays } from "../../../src/domain/scheduling";
import { getDisponibilidad, crearCita } from "../../../src/services/citas.service";
import { useAuth } from "../../../src/hooks/useAuth";

export default function NuevaCita() {
  const { user } = useAuth();
  const dias = useMemo(() => nextAllowedDays(new Date(), 2, false, []), []);
  const [fecha, setFecha] = useState<string | null>(null);
  const [dispo, setDispo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function seleccionarFecha(d: Date) {
    const iso = dayjs(d).format("YYYY-MM-DD");
    setFecha(iso);
    setLoading(true);
    try {
      const res = await getDisponibilidad(iso);
      setDispo(res);
    } finally {
      setLoading(false);
    }
  }

  async function reservar(medico_id: number, start: string, end: string) {
    await crearCita({ user_id: user!.id, medico_id, start, end });
    alert("Cita reservada (demo)");
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Selecciona un día</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {dias.map((d) => (
          <Button
            key={d.toISOString()}
            title={dayjs(d).format("dddd DD/MM")}
            onPress={() => seleccionarFecha(d)}
          />
        ))}
      </View>

      {fecha && (
        <View style={{ marginTop: 16, gap: 12 }}>
          <Text style={{ fontWeight: "700" }}>
            Disponibilidad para {dayjs(fecha).format("DD/MM/YYYY")}
          </Text>
          {loading && <Text>Cargando disponibilidad...</Text>}
          {!loading && dispo.map((m) => (
            <View key={m.medico.id} style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 8 }}>
              <Text style={{ fontWeight: "600" }}>
                {m.medico.nombre} — {m.medico.especialidad}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {m.slots.filter((s: any) => s.libre).slice(0, 12).map((s: any) => (
                  <Button
                    key={s.start}
                    title={dayjs(s.start).format("HH:mm")}
                    onPress={() => reservar(m.medico.id, s.start, s.end)}
                  />
                ))}
                {m.slots.filter((s: any) => s.libre).length === 0 && (
                  <Text>No hay horarios libres</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
