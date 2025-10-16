// app/user/citas/_layout.tsx
import { Stack } from "expo-router";
export default function CitasLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "Citas",
      }}
    />
  );
}