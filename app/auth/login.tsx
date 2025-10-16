// Pantalla de login por matrícula (con mocks: cualquier contraseña).
// Si matrícula termina en "00" => admin, si no => user (lo resuelve el mock).
import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useRouter } from "expo-router";

export default function Login() {
  const { signIn, loading, error } = useAuth();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    const u = await signIn(matricula.trim(), password);
    if (u) router.replace(u.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  }
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Ingresar</Text>
      <Text style={{ opacity: 0.7 }}>Usa matrícula y contraseña (demo: cualquier contraseña)</Text>

      <TextInput
        placeholder="Matrícula (ej: 12345 o 9900 para admin)"
        autoCapitalize="none"
        value={matricula}
        onChangeText={setMatricula}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <Button
        title={loading ? "Ingresando..." : "Entrar"}
        onPress={handleLogin}          // 👈 usa la función que redirige
      />
      {!!error && <Text style={{ color: "red" }}>{String(error)}</Text>}

      <View style={{ marginTop: 16 }}>
        <Text>Demo:</Text>
        <Text>- Usuario: matrícula 12345</Text>
        <Text>- Admin: matrícula 9900</Text>
      </View>
    </View>
  );
}
