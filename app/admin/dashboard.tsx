import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function AdminDashboard() {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Panel de administración</Text>

      <Link href="/admin/reservas" asChild>
        <Button title="Ver todas las citas" />
      </Link>

      <Link href="/admin/especialidad" asChild>
        <Button title="Gestionar médicos y especialidades" />
      </Link>
         <Link href="auth/login" asChild>
          <Button title="Salir"/>
        </Link>
 
    </View>
  );
}
