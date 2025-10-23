
// app/index.tsx
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

export default function Index() {
  const [dest, setDest] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const admin = await SecureStore.getItemAsync('admin_token');
      const user = await SecureStore.getItemAsync('user_token');

      if (admin) setDest('/admin/dashboard');
      else if (user) setDest('/user/dashboard');
      else setDest('/auth/login'); // o '/auth/admin' si quieres que primero vaya a login admin
    })();
  }, []);

  if (!dest) return null; // puede ser un spinner

  return <Redirect href={dest} />;
}
