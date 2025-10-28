// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext'; // ajusta ruta si cambia
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from 'react-native';
// Tema base (puedes personalizar colores)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#46791fff',
    secondary: '#14b8a6',
  },
};
function WithInsets({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, paddingTop: insets.top + 25 }}>{children}</View>;
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <WithInsets>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
      </WithInsets>
    </AuthProvider>
  );
}
