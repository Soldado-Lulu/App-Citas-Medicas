import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { getPersonas, Persona } from '../../src/services/personas.service';

export default function UserDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { personas } = await getPersonas('', 1, 10);
        if (alive) setPersonas(personas);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <Text>Cargando...</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: '700', fontSize: 18 }}>Hola </Text>
      {personas.map(p => (
        <Text key={p.idpoblacion}>• {p.nombre_completo} — {p.matricula}</Text>
      ))}
    </View>
  );
}
