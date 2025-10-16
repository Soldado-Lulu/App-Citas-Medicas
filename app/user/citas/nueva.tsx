import { useMemo, useState, useEffect } from "react";
import { View, Text, Button, ScrollView, Alert } from "react-native";
import dayjs from "@/lib/dayjs";
import { nextAllowedDays } from "../../../src/domain/scheduling";
import { getDisponibilidad, crearCita, getMisCitas } from "../../../src/services/citas.service";
import { getPersonas, Persona } from "../../../src/services/personas.service";
import { useAuth } from "../../../src/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";

export default function NuevaCita() {
  const { user } = useAuth();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const titularId = user!.id;
  const personaId = Number(personId) || titularId; // por defecto, titular

  // ---- estados (declarados ANTES de usarlos en efectos)
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [fecha, setFecha] = useState<string | null>(null);
  const [dispo, setDispo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [yaTieneEseDia, setYaTieneEseDia] = useState(false);

  // ---- cargar personas (titular + afiliados)
  useEffect(() => {
    (async () => {
      try {
        const data = await getPersonas(titularId);
        setPersonas(data);
      } catch {
        /* opcional: Alert.alert("Error", "No se pudo cargar personas."); */
      }
    })();
  }, [titularId]);

  const personaSeleccionada = useMemo(
    () => personas.find((p) => p.id === personaId),
    [personas, personaId]
  );

  // ---- calcular días permitidos (2 hábiles)
  const dias = useMemo(() => nextAllowedDays(new Date(), 2, false, []), []);

  // ---- verificar si la persona ya tiene cita en 'fecha'
  useEffect(() => {
    (async () => {
      if (!fecha) return; // aún no hay fecha seleccionada
      const todas = await getMisCitas(titularId); // del titular y sus personas
      const tiene = todas.some(
        (c: any) =>
          c.person_id === personaId &&
          dayjs(c.start).format("YYYY-MM-DD") === fecha &&
          c.estado === "reservada"
      );
      setYaTieneEseDia(tiene);
    })();
  }, [fecha, personaId, titularId]);

  // ---- seleccionar día => carga disponibilidad
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

  // ---- reservar
  async function reservar(medico_id: number, start: string, end: string) {
    try {
      await crearCita({
        person_id: personaId,  // para quién
        booked_by: titularId,  // quién reserva
        medico_id,
        start,
        end,
      });
      Alert.alert("Éxito", "Cita reservada (demo).");
      // recalcular bandera por si el usuario intenta reservar de nuevo el mismo día
      if (fecha) setYaTieneEseDia(true);
    } catch (e: any) {
      Alert.alert("No se pudo reservar", e?.message || "Inténtalo nuevamente.");
    }
  }

  // ---- autoseleccionar el primer día disponible al entrar
  useEffect(() => {
    if (!fecha && dias[0]) seleccionarFecha(dias[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      {/* Datos del asegurado y destinatario */}
      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, backgroundColor: "#fff", gap: 4 }}>
        <Text style={{ fontWeight: "700" }}>Datos del asegurado</Text>
        <Text>Titular: {user?.name} — Matrícula: {user?.matricula}</Text>
        {personaSeleccionada && (
          <Text>
            Reservando para: {personaSeleccionada.name} ({personaSeleccionada.relation}
            {personaSeleccionada.isTitular ? " — Titular" : ""})
          </Text>
        )}
      </View>

      {/* Aviso si ya tiene cita ese día */}
      {yaTieneEseDia && fecha && (
        <Text style={{ color: "#c00" }}>
          Esta persona ya tiene una cita el {dayjs(fecha).format("DD/MM/YYYY")}.
        </Text>
      )}

      <Text style={{ fontSize: 18, fontWeight: "700" }}>Selecciona un día</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {dias.map((d) => (
          <Button
            key={d.toISOString()}
            title={dayjs(d).format("dddd DD/MM").toUpperCase()}
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

          {!loading &&
            dispo.map((m) => (
              <View key={m.medico.id} style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 8 }}>
                <Text style={{ fontWeight: "600" }}>
                  {m.medico.nombre} — {m.medico.especialidad}
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {m.slots.filter((s: any) => s.libre).slice(0, 30).map((s: any) => (
                    <Button
                      key={s.start}
                      title={dayjs(s.start).format("HH:mm")}
                      onPress={() => reservar(m.medico.id, s.start, s.end)}
                      disabled={yaTieneEseDia} // deshabilita si ya tiene una ese día
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
