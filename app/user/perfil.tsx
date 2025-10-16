import { View, Text } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";

export default function Perfil() {
  const { user } = useAuth();
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Mi perfil</Text>
      <Text>Nombre: {user?.name}</Text>
      <Text>Matrícula: {user?.matricula}</Text>
      <Text>Rol: {user?.role}</Text>
    </View>
  );
}
