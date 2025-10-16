import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function UserDashboard() {
  const { user } = useAuth();


  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Hola, {user?.name}</Text>

      {/* 👇 con prefijos /user/... */}
      <Link href="/user/citas/nueva" asChild>
        <Button title="Agendar nueva cita" />
      </Link>
      <Link href="/user/citas" asChild>
        <Button title="Mis citas" />
      </Link>
      <Link href="/auth/login" asChild> 
        <Button title="Cerrar sesión" />
      </Link>
      
    </View>
  );
}
