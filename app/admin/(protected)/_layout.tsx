// app/admin/(protected)/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { storage } from '@/lib/storage'; // ajusta si tu path difiere

export default function AdminProtectedLayout() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await storage.getItem(storage.TOKENS.admin);
      if (!alive) return;
      if (token) setAllowed(true);
      else {
        setAllowed(false);
        router.replace('/admin/(public)/login'); // 🔐 sin token → login admin
      }
    })();
    return () => { alive = false; };
  }, [router]);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/admin/(protected)/dashboard'); // fallback
  };

  const onLogout = async () => {
    await storage.removeItem(storage.TOKENS.admin);
    router.replace('/admin/(public)/login');
  };

  if (allowed === null) return <View style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      {/* Appbar global para todas las pantallas protegidas */}
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="Administración" />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      {/* Contenido de cada pantalla protegida */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
}
