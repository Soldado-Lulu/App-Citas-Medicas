import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { storage } from '../src/lib/storage';

export default function Index() {
  const [dest, setDest] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const admin = await storage.getItem(storage.TOKENS.admin);
      const user  = await storage.getItem(storage.TOKENS.user);
      setDest(admin ? '/admin/dashboard' : user ? '/user/dashboard' : '/auth/login');
    })();
  }, []);
  if (!dest) return null;
  return <Redirect href={dest} />;
}
