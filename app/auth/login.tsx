import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';

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
          {error === 'Matrícula no encontrada' ? error : 'Error de autenticación'}
        </Text>
      )}
    </View>
  );
}
