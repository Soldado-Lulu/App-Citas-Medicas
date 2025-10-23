// Layout del "área admin" (grupo invisible). Protege por rol "admin".
// app/admin/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Panel Admin' }} />
      <Stack.Screen name="fichas" options={{ title: 'Fichas' }} />
    </Stack>
  );
}
