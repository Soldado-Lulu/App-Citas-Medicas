import { Stack, Redirect, Link } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { Pressable, Text } from "react-native";

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/auth/login" />;
  if (user.role !== "admin") return <Redirect href="/user/dashboard" />;

  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Panel Admin",
          headerRight: () => (
            <Link href="/admin/especialidad" asChild>
              <Pressable style={{ paddingHorizontal: 12 }}>
                <Text style={{ fontWeight: "600" }}>Gestión</Text>
              </Pressable>
            </Link>
          )
        }}
      />
      <Stack.Screen name="reservas/index" options={{ title: "Todas las citas" }} />
      <Stack.Screen name="especialidad/index" options={{ title: "Médicos y especialidades" }} />
    </Stack>
  );
}
