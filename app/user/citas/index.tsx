// Listado de citas (mock o real)
// Muestra citas del titular y sus afiliados, con información detallada.

import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuth } from "../../../src/hooks/useAuth";
import { getMisCitas } from "../../../src/services/citas.service";
import { getPersonas, Persona } from "../../../src/services/personas.service";
import dayjs from "@/lib/dayjs";

export default function MisCitas() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar citas del titular y afiliados
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMisCitas(user!.id);
        const pers = await getPersonas(user!.id);
        if (mounted) {
          setRows(data);
          setPersonas(pers);
        }
      } catch (e) {
        console.error("Error al cargar citas:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  function getNombrePersona(person_id: number) {
    const p = personas.find((x) => x.id === person_id);
    return p ? `${p.name}${p.isTitular ? " (Titular)" : ""}` : "—";
  }

  function getRelacion(person_id: number) {
    const p = personas.find((x) => x.id === person_id);
    return p?.relation ? `— ${p.relation}` : "";
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case "reservada":
        return "#1E88E5";
      case "atendida":
        return "#43A047";
      case "cancelada":
        return "#E53935";
      default:
        return "#757575";
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        Mis citas
      </Text>

      {loading && <Text>Cargando...</Text>}
      {!loading && rows.length === 0 && <Text>No tienes citas registradas.</Text>}

      {rows.map((c) => (
        <View
          key={c.id}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          {/* 🔹 Médico */}
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>
            {c.medico_nombre
              ? `Dr(a). ${c.medico_nombre} — ${c.medico_especialidad || ""}`
              : `Médico ID: ${c.medico_id}`}
          </Text>

          {/* 🔹 Persona y afiliación */}
          <Text style={{ marginBottom: 2 }}>
            Paciente: {getNombrePersona(c.person_id)} {getRelacion(c.person_id)}
          </Text>
          <Text style={{ marginBottom: 6 }}>
            Reservado por: {user?.name} — Matrícula {user?.matricula}
          </Text>

          {/* 🔹 Fechas y estado */}
          <Text>
            Fecha: {dayjs(c.start).format("DD/MM/YYYY")}{" "} — Hora: {dayjs(c.start).format("HH:mm")}
          </Text>
          <Text>  Duración: {Math.round((dayjs(c.end).diff(dayjs(c.start), "minute") + Number.EPSILON) * 100) / 100} minutos</Text>
          <Text style={{ color: getEstadoColor(c.estado), fontWeight: "700" }}>
            Estado: {c.estado.toUpperCase()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
