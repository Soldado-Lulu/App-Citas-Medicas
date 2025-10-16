// Página 404 (cuando una ruta no coincide con ningún archivo de "app/").
// Es útil para producción y durante dev, queda más amigable que la pantalla por defecto.


import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>nooooooooooo funcionaaaaaaaaaaaaa2345</Text>
      <Link href="/">Ir al inicio</Link>
    </View>
  );
}
