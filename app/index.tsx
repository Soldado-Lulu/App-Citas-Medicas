import { Redirect } from 'expo-router';

export default function Index() {
  // 🔹 Siempre redirige al login de usuario
  return <Redirect href="/auth/login" />;
}
