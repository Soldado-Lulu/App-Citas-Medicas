import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useEffect } from 'react';
import { api, baseURL } from '../../src/services/http';

export default function Login() {
  const { signIn, loading } = useAuth();
  const [matricula, setMatricula] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin() {
    setErr(null);
    const u = await signIn(matricula.trim());
    if (!u) return setErr('Matrícula no encontrada');
    router.replace(u.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  }

useEffect(() => {
  (async () => {
    try {
      console.log('PING ->', baseURL);
      const r = await api('/health');
      console.log('PING OK', r);
    } catch (e) {
      console.log('PING FAIL', e);
    }
  })();
}, []);

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Ingresar</Text>
      <TextInput
        placeholder="Matrícula (ej. 860625PUL)"
        autoCapitalize="characters"
        value={matricula}
        onChangeText={setMatricula}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <Button title={loading ? 'Ingresando...' : 'Entrar'} onPress={handleLogin} />
      {!!err && <Text style={{ color: 'red' }}>{err}</Text>}
    </View>
  );
}
