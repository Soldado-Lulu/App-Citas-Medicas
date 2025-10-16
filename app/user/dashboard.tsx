import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { getPersonas, Persona } from "../../src/services/personas.service";

export default function UserDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPersonas(user!.id);
        if (mounted) setPersonas(data);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Hola, {user?.name}</Text>

      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 8 }}>Personas a cargo</Text>

      {loading && <Text>Cargando...</Text>}
      {!loading && personas.length === 0 && <Text>No hay personas.</Text>}

      {/* Tabla simple */}
      {!loading && personas.length > 0 && (
        <View style={{ borderWidth: 1, borderRadius: 8 }}>
          {/* Encabezado */}
          <View style={{ flexDirection: "row", padding: 10, backgroundColor: "#f2f2f2" }}>
            <Text style={{ flex: 1, fontWeight: "700" }}>Nombre</Text>
            <Text style={{ width: 90, fontWeight: "700" }}>Relación</Text>
            <Text style={{ width: 150, fontWeight: "700", textAlign: "right" }}>Acciones</Text>
          </View>

          {/* Filas */}
          {personas.map(p => (
            <View key={p.id} style={{ flexDirection: "row", padding: 10, borderTopWidth: 1, alignItems: "center" }}>
              <Text style={{ flex: 1 }}>{p.name}{p.isTitular ? " (Titular)" : ""}</Text>
              <Text style={{ width: 90 }}>{p.relation}</Text>
              <View style={{ width: 150, flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                <Link href={`/user/citas/nueva?personId=${p.id}`} asChild>
                  <Button title="Agendar" />
                </Link>
                <Link href={`/user/citas?personId=${p.id}`} asChild>
                  <Button title="Ver citas" />
                </Link>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Accesos tradicionales (opcional) */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <Link href="/user/citas" asChild>
          <Button title="Mis citas (todas)" />
        </Link>
       
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
         <Link href="auth/login" asChild>
          <Button title="Salir"/>
        </Link>
      </View>
    </View>
  );
}
