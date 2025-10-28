// app/login/_layout.tsx
import { Stack } from 'expo-router';
export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerTitle: 'Acceso' }}>
      <Stack.Screen name="admin" options={{ title: 'Login Administrador' }} />
    </Stack>
  );
}
