// app/admin/(public)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../../../src/lib/storage'; // ajusta si tu storage está en otra ruta

const API = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:4000';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [palabraClave, setPalabraClave] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    setErr(null); setBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), palabraClave }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.msg || data?.message || `HTTP ${res.status}`);

   await storage.setItem(storage.TOKENS.admin, data.token);
router.replace('/admin/(protected)/dashboard');
    } catch (e:any) { setErr(e?.message || 'No se pudo iniciar sesión'); }
    finally { setBusy(false); }
  };

  return (
    <View style={{ flex:1, padding:24, justifyContent:'center', gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>Login Administrador</Text>
      <TextInput
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth:1, borderColor:'#ddd', borderRadius:12, padding:12 }}
      />
      <TextInput
        placeholder="Palabra clave"
        value={palabraClave}
        onChangeText={setPalabraClave}
        secureTextEntry
        style={{ borderWidth:1, borderColor:'#ddd', borderRadius:12, padding:12 }}
      />
      {err ? <Text style={{ color:'tomato' }}>{err}</Text> : null}
      <TouchableOpacity
        onPress={onLogin}
        disabled={busy}
        style={{ backgroundColor:'#2563eb', padding:14, borderRadius:12, alignItems:'center' }}
      >
        <Text style={{ color:'#fff', fontWeight:'700' }}>{busy ? 'Entrando…' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}
