// app/admin/(protected)/_layout.tsx
// ————————————————————————————————————————————————
// Layout de *admin protegido*:
// - Si no hay token admin → redirige a /admin/(public)/login
// - Appbar con botón Back y Logout visible en todas las pantallas hijas.
// ————————————————————————————————————————————————
import React, { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { storage } from '@/src/lib/storage';

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

  // Navegación: volver o fallback al dashboard
  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/admin/(protected)/dashboard');
  };

  // Logout admin: borra token y al login
  const onLogout = async () => {
    await storage.removeItem(storage.TOKENS.admin);
    router.replace('/admin/(public)/login');
  };

  if (allowed === null) return <View style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="Administración" />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
}
