// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext'; // ajusta ruta si cambia
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Tema base (puedes personalizar colores)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb',
    secondary: '#14b8a6',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </AuthProvider>
  );
}
