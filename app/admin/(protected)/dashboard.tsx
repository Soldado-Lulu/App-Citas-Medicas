import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '@/src/lib/storage';

export default function AdminDashboard() {
  const router = useRouter();

  const GoCard = ({
    title, subtitle, icon, href,
  }: { title: string; subtitle: string; icon: any; href: string }) => (
    <Card mode="outlined" style={{ borderRadius: 16 }}>
      <Card.Title
        title={title}
        subtitle={subtitle}
        // ✅ usa solo size para evitar error de tipos
        left={(props) => <MaterialCommunityIcons name={icon} size={props.size} />}
      />
      <Card.Actions>
        <Button mode="contained" onPress={() => router.push(href)}>Ir</Button>
      </Card.Actions>
    </Card>
  );

 
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Panel Admin" />
      </Appbar.Header>

      <View style={{ padding: 16, gap: 12 }}>
        <GoCard
          title="Establecimientos"
          subtitle="Ver y buscar establecimientos"
          icon="office-building"
          href="/admin/(protected)/establecimiento"
        />
        <GoCard
          title="Médicos"
          subtitle="Listado y búsqueda de médicos"
          icon="stethoscope"
          href="/admin/(protected)/medicos"
        />
        <GoCard
          title="Fichas"
          subtitle="Gestión / consulta de fichas"
          icon="file-document"
          href="/admin/(protected)/fichas"
        />
      </View>
    </View>
  );
}
