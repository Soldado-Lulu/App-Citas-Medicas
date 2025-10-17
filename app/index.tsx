import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { user, role, loading } = useAuth();

  if (loading) return null;                         // evita parpadeo
  if (!user) return <Redirect href="/auth/login" />;

  return (
    <Redirect href={role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} />
  );
}
