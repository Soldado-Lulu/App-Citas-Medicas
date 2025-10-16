import { Stack, Link } from "expo-router";
import { Pressable, Text } from "react-native";

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        headerStyle: { backgroundColor: "#0B74DE" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Inicio",
          headerRight: () => (
            <Link href="/user/perfil" asChild>
              <Pressable style={{ paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Perfil</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      {/* Las demás pantallas (citas/, etc.) heredan este header */}
    </Stack>
  );
}
