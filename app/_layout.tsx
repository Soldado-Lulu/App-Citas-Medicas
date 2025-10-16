// Layout raíz: envuelve toda la app con el AuthProvider y define un Stack base.
// Con Expo Router, este archivo se ejecuta en TODAS las rutas.

import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/Authcontext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,    // desactivamos header nativo global
          animation: "fade",
        }}
      />
    </AuthProvider>
  );
}
