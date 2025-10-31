// app/auth/login.tsx
// ————————————————————————————————————————————————
// Login de *usuario* por matrícula.
// - Usa useAuth() que llama al backend y valida establecimiento.
// - Si todo OK, navega al dashboard protegido.
// ————————————————————————————————————————————————
import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { Text as PaperText } from 'react-native-paper';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  async function onSubmit() {
    if (!matricula.trim()) return;
    const u = await signIn(matricula.trim());
    if (u) router.replace('/user/dashboard');
  }
function WithInsets({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={{padding:30 }}>{children}</View>;
}
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', flex: 1 }}>
     <WithInsets > 
      <PaperText variant="displaySmall">Caja Nacional de Salud</PaperText>
       </WithInsets>
      <TextInput
        placeholder="Matrícula (ej. 123456ABC)"
        value={matricula}
        onChangeText={setMatricula}
        autoCapitalize="characters"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <Button title="ENTRAR" onPress={onSubmit} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {!!error && (
        <Text style={{ color: 'red', marginTop: 12 }}>
          {error}
        </Text>
      )}
  
    </View>
  );
}
