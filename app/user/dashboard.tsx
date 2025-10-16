import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";
import type { ViewStyle } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { getPersonas, Persona } from "../../src/services/personas.service";
import { getMisCitas } from "../../src/services/citas.service";
import dayjs from "@/lib/dayjs";

// ---- Helpers de layout responsivo
function useColumns() {
  const { width } = useWindowDimensions();
  if (width >= 1200) return 3;
  if (width >= 768) return 2;
  return 1;
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 16,
    paddingHorizontal: Platform.select({ web: 24, default: 16 }),
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginTop: -12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginHorizontal: 6,
    marginTop: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginTop: 6,
  },
  smallButton: {
    flexGrow: 1,
    minWidth: 110,
    marginHorizontal: 4,
    marginTop: 8,
  },
});

// Tarjeta clickeable (reutilizable)
const CardPressable = ({
  children,
  href,
  style,
}: {
  children: React.ReactNode;
  href: string;
  style?: ViewStyle;
}) => (
  <View style={[styles.card, style]}>
    <Link href={href} asChild>
      <Pressable>{children}</Pressable>
    </Link>
  </View>
);

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cols = useColumns();

  const cardStyle = useMemo<ViewStyle>(() => {
    return { width: `${100 / cols}%` };
  }, [cols]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pers, citas] = await Promise.all([
          getPersonas(user!.id),
          getMisCitas(user!.id),
        ]);
        if (!mounted) return;
        setPersonas(pers);
        setRows(citas);
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
    return p?.relation ? ` — ${p.relation}` : "";
  }

  // 🔹 Resumen: primeras 5 citas reservadas (pasadas o futuras), orden ascendente
  const resumen = useMemo(() => {
    return rows
      .filter((c) => c.estado === "reservada")
      .sort((a, b) => (a.start > b.start ? 1 : -1))
      .slice(0, 5);
  }, [rows]);
/*
mostrar citas futuros no pasadas
const resumen = useMemo(() => {
  return rows
    .filter(c => c.estado === "reservada" && dayjs(c.start).isAfter(dayjs().subtract(1, "minute")))
    .sort((a, b) => (a.start > b.start ? 1 : -1))
    .slice(0, 5);
}, [rows]);
*/ 
  return (
    <View style={styles.page}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        Hola, {user?.name}
      </Text>

      {/* Accesos rápidos + Resumen de citas */}
      <View style={styles.grid}>
        <CardPressable href="/user/citas/nueva" style={cardStyle}>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>
            Agendar nueva cita
          </Text>
        </CardPressable>

        <View style={[styles.card, cardStyle]}>
          <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
            Próximas citas
          </Text>

          {resumen.length === 0 && <Text>Sin citas.</Text>}

          {resumen.map((c) => (
            <Text key={c.id} style={{ marginBottom: 6 }}>
              {getNombrePersona(c.person_id)}
              {getRelacion(c.person_id)} — {dayjs(c.start).format("DD/MM HH:mm")}
            </Text>
          ))}

          <View style={{ marginTop: 8 }}>
            <Link href="/user/citas" asChild>
              <Button title="Ver todas" />
            </Link>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Personas a cargo</Text>

      {loading && <Text>Cargando...</Text>}
      {!loading && personas.length === 0 && <Text>No hay personas.</Text>}

      {!loading && personas.length > 0 && (
        <View style={styles.grid}>
          {personas.map((p) => (
            <View key={p.id} style={[styles.card, cardStyle]}>
              <View style={styles.row}>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", flexShrink: 1 }}
                >
                  {p.name}
                </Text>
                <Text style={{ color: "#6b7280", marginLeft: 8 }}>
                  {p.isTitular ? "• Titular" : `• ${p.relation}`}
                </Text>
              </View>

              <View style={styles.actions}>
                <View style={styles.smallButton}>
                  <Link href={`/user/citas/nueva?personId=${p.id}`} asChild>
                    <Button title="Agendar" />
                  </Link>
                </View>
                <View style={styles.smallButton}>
                  <Link href={`/user/citas?personId=${p.id}`} asChild>
                    <Button title="Ver citas" />
                  </Link>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.row, { marginTop: 8, flexWrap: "wrap" }]}>
        <Link href="/user/citas" asChild>
          <Button title="Mis citas (todas)" />
        </Link>
        <View style={{ width: 8 }} />
        <Button
          title="Salir"
          onPress={() => {
            signOut();
            router.replace("/auth/login");
          }}
        />
      </View>
    </View>
  );
}
