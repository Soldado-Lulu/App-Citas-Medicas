import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';

export default function UserLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Inicio' }} />
      <Stack.Screen name="citas/index" options={{ title: 'Mis Citas' }} />
      <Stack.Screen name="citas/nueva" options={{ title: 'Nueva Cita' }} />
    </Stack>
  );
}
