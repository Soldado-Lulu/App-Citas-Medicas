// app/auth/login.tsx
// ————————————————————————————————————————————————
// Login de *usuario* por matrícula.
// - Usa useAuth() que llama al backend y valida establecimiento.
// - Si todo OK, navega al dashboard protegido.
// ————————————————————————————————————————————————
import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  async function onSubmit() {
    if (!matricula.trim()) return;
    const u = await signIn(matricula.trim());
    if (u) router.replace('/user/dashboard');
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Matrícula (ej. 860625PUL)"
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
