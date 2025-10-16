// Layout del "área admin" (grupo invisible). Protege por rol "admin".

import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/dashboard" />;

  return (
    <Stack>
      <Stack.Screen name="admin-dashboard" options={{ title: "Panel Admin" }} />
    </Stack>
  );
}
