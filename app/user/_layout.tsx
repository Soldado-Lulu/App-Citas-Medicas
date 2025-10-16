// Layout del "área usuario" (grupo invisible). Protege rutas por rol "user".
// Si no hay sesión: redirige a /login. Si es admin: lo manda a /admin-dashboard.

import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function UserLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  if (user.role !== "user") return <Redirect href="/admin-dashboard" />;

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: "Inicio" }} />
      <Stack.Screen name="citas/index" options={{ title: "Mis Citas" }} />
      <Stack.Screen name="citas/nueva" options={{ title: "Nueva Cita" }} />
     
    </Stack>
  );
}
