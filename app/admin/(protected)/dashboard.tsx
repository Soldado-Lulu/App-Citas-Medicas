// app/admin/dashboard.tsx
import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Dashboard() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Panel Admin</Text>

      <Link href="/admin/fichas" asChild>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
            Ver fichas
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
