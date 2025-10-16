
// Dashboard simple de admin (luego puedes agregar ABM médicos, configuración, etc.).

import { View, Text } from "react-native";

export default function AdminDashboard() {
  return (
    <View style={{ padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Panel Administrador</Text>
      <Text>KPIs, gestión de médicos y configuración (demo por ahora).</Text>
    </View>
  );
}
