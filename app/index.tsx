import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/auth/login" />; // carpeta visible 'auth'
  return <Redirect href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} />;
}
