import { Redirect, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { storage } from '../../../src/lib/storage';

export default function AdminProtectedLayout() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const t = await storage.getItem(storage.TOKENS.admin);
      setOk(!!t);
    })();
  }, []);

  if (ok === null) return null;           // spinner si quieres
  if (!ok) return <Redirect href="/admin/login" />;

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'Panel Admin' }} />
      <Stack.Screen name="fichas"    options={{ title: 'Fichas' }} />
    </Stack>
  );
}
